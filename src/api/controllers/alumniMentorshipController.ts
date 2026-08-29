import { Request, Response } from "express";
import { AlumniMentorshipEngine } from "../../services/alumniMentorshipEngine.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess } from "../../lib/apiResponse.js";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId } from "../../lib/utils.js";
import { emailService } from "../../services/emailService.js";

/**
 * Controller for Enterprise Campus Alumni Mentorship & Career Guidance
 */
export const getAlumniMentors = async (req: Request, res: Response) => {
  const { campusName, expertiseDomain, availabilityStatus, search } = req.query;

  const filters = {
    campusName: typeof campusName === 'string' ? campusName : undefined,
    expertiseDomain: typeof expertiseDomain === 'string' ? expertiseDomain : undefined,
    availabilityStatus: typeof availabilityStatus === 'string' ? availabilityStatus : undefined,
    search: typeof search === 'string' ? search : undefined,
  };

  const results = await AlumniMentorshipEngine.getMentors(filters);
  return sendSuccess(res, { data: results, count: results.length });
};

export const registerAlumniMentor = async (req: Request, res: Response) => {
  const {
    mentorName,
    campusName,
    alumniGraduationYear,
    currentJobTitle,
    currentCompany,
    expertiseDomain,
    maxMenteesCapacity,
    bioSummary,
  } = req.body;

  if (!mentorName || !campusName || !currentJobTitle || !currentCompany || !expertiseDomain) {
    throw AppError.badRequest("Missing required alumni mentor fields");
  }

  const created = await AlumniMentorshipEngine.registerMentor({
    mentorName,
    campusName,
    alumniGraduationYear: Number(alumniGraduationYear) || new Date().getFullYear() - 5,
    currentJobTitle,
    currentCompany,
    expertiseDomain,
    maxMenteesCapacity: Number(maxMenteesCapacity) || 3,
    bioSummary: bioSummary || "",
  });

  return sendSuccess(res, { data: created }, 201);
};

export const bookAlumniMentorshipSession = async (req: Request, res: Response) => {
  const paramId = req.params.id;
  const id = Array.isArray(paramId) ? paramId[0] : paramId;
  const { studentName, sessionTopic } = req.body;

  if (!id) throw AppError.badRequest("Mentor ID is required");

  const updated = await AlumniMentorshipEngine.requestSession(
    id,
    studentName || "Undergraduate Student",
    sessionTopic || "Career Guidance & Technical Resume Review"
  );

  if (!updated) {
    throw AppError.badRequest("Mentor not available or capacity exceeded");
  }

  return sendSuccess(res, { data: updated });
};

/**
 * Masked Mentorship Communication Request Handler (Node.js/Express)
 * Protects alumni privacy by masking direct email addresses until accepted.
 */
export const createMentorshipIntroduction = async (req: Request, res: Response) => {
  const { alumniId, requestType, messageBody } = req.body;
  const studentId = req.user?.id || req.user?.uid || (req.user as any)?._id || "student_user";

  if (!alumniId || !requestType || !messageBody) {
    return res.status(400).json({ error: "Missing required fields: alumniId, requestType, and messageBody are required." });
  }

  try {
    let alumni: any = null;
    if (dbQuery) {
      const queryConds: any[] = [{ uid: alumniId }, { id: alumniId }];
      const oid = safeObjectId(alumniId);
      if (oid) queryConds.push({ _id: oid });
      alumni = await dbQuery.collection("users").findOne({ $or: queryConds });
    }

    if (!alumni) {
      const mentors = await AlumniMentorshipEngine.getMentors({});
      const found = mentors.find((m: any) => m.id === alumniId || m._id === alumniId || m.slotId === alumniId);
      if (found) {
        alumni = {
          id: alumniId,
          uid: alumniId,
          name: found.mentorName,
          email: `${found.mentorName.toLowerCase().replace(/\s+/g, '.')}@alumni.org`,
          alumni_status: 'alumni',
          is_open_to_mentoring: true,
        };
      } else {
        const defaultAlumni = [
          { id: 'alm_1', uid: 'alm_1', name: 'Siddharth Rao', email: 'siddharth@google.com', alumni_status: 'alumni', is_open_to_mentoring: true },
          { id: 'alm_2', uid: 'alm_2', name: 'Kavya Nair', email: 'kavya@microsoft.com', alumni_status: 'alumni', is_open_to_mentoring: true },
          { id: 'alm_3', uid: 'alm_3', name: 'Rohan Sharma', email: 'rohan@openai.com', alumni_status: 'alumni', is_open_to_mentoring: false }
        ];
        alumni = defaultAlumni.find(a => a.id === alumniId || a.uid === alumniId);
      }
    }

    const isAlumniStatus = alumni?.alumni_status === 'alumni' || alumni?.alumniStatus === 'alumni';
    const isOpenToMentoring = alumni?.is_open_to_mentoring === true || alumni?.isOpenToMentoring === true;

    if (!alumni || !isAlumniStatus || !isOpenToMentoring) {
      return res.status(400).json({ error: "Alumni user is not accepting mentorship requests." });
    }

    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const connectionRequest = {
      _id: connectionId,
      student_id: studentId,
      alumni_id: alumniId,
      request_type: requestType,
      message: messageBody,
      status: 'pending',
      createdAt: new Date(),
    };

    if (dbCommand) {
      await dbCommand.collection("connections").insertOne(connectionRequest);
    }

    await emailService.sendMaskedIntroductionEmail({
      to: alumni.email || "alumni-privacy@community.org",
      from: "platform-mentorship@community.org",
      subject: `New Mentorship Request: ${requestType.replace('_', ' ')}`,
      body: messageBody,
      acceptLink: `https://platform.com/connections/${connectionId}`,
    });

    return res.status(201).json({
      success: "Mentorship request securely forwarded to the alumnus.",
      connectionRequestId: connectionId,
    });
  } catch (error) {
    console.error("Error creating mentorship introduction:", error);
    return res.status(500).json({ error: "Internal server processing failure." });
  }
};

/**
 * Searchable Alumni Directory Controller
 * Supports multi-criteria filtering by college, current company, role, mentorship opt-in status.
 */
export const getAlumniDirectory = async (req: Request, res: Response) => {
  const { college, university, current_company, company, role, field, search, isOpenToMentoring } = req.query;

  try {
    let alumniList: any[] = [];
    if (dbQuery) {
      const queryConds: any[] = [];

      const collegeVal = (college || university) as string;
      if (collegeVal) {
        queryConds.push({ college: { $regex: collegeVal, $options: 'i' } });
      }

      const compVal = (current_company || company) as string;
      if (compVal) {
        queryConds.push({
          $or: [
            { current_company: { $regex: compVal, $options: 'i' } },
            { currentCompany: { $regex: compVal, $options: 'i' } },
          ],
        });
      }

      const roleVal = (role || field) as string;
      if (roleVal) {
        queryConds.push({
          $or: [
            { field: { $regex: roleVal, $options: 'i' } },
            { currentRole: { $regex: roleVal, $options: 'i' } },
          ],
        });
      }

      if (isOpenToMentoring !== undefined) {
        const isMentoring = isOpenToMentoring === 'true' || isOpenToMentoring === '1';
        queryConds.push({
          $or: [
            { is_open_to_mentoring: isMentoring },
            { isOpenToMentoring: isMentoring },
          ],
        });
      }

      if (search) {
        const sRegex = new RegExp(search as string, 'i');
        queryConds.push({
          $or: [
            { name: sRegex },
            { college: sRegex },
            { current_company: sRegex },
            { currentCompany: sRegex },
            { field: sRegex },
            { bio: sRegex },
          ],
        });
      }

      const mongoQuery: any = {
        $or: [
          { alumni_status: 'alumni' },
          { alumniStatus: 'alumni' },
        ],
      };

      if (queryConds.length > 0) {
        mongoQuery.$and = queryConds;
      }

      alumniList = await dbQuery.collection("users").find(mongoQuery).toArray();
    }

    if (!alumniList || alumniList.length === 0) {
      const defaultAlumni = [
        {
          id: 'alm_1',
          uid: 'alm_1',
          name: 'Siddharth Rao',
          college: 'IIT Bombay',
          graduation_year: 2023,
          current_company: 'Google',
          field: 'Senior SWE',
          alumni_status: 'alumni',
          is_open_to_mentoring: true,
        },
        {
          id: 'alm_2',
          uid: 'alm_2',
          name: 'Kavya Nair',
          college: 'BITS Pilani',
          graduation_year: 2022,
          current_company: 'Microsoft',
          field: 'Tech Lead',
          alumni_status: 'alumni',
          is_open_to_mentoring: true,
        },
        {
          id: 'alm_3',
          uid: 'alm_3',
          name: 'Rohan Sharma',
          college: 'IIIT Hyderabad',
          graduation_year: 2024,
          current_company: 'OpenAI',
          field: 'AI Research Scientist',
          alumni_status: 'alumni',
          is_open_to_mentoring: false,
        },
      ];

      alumniList = defaultAlumni.filter((a) => {
        if (college && !a.college.toLowerCase().includes((college as string).toLowerCase())) return false;
        if (current_company && !a.current_company.toLowerCase().includes((current_company as string).toLowerCase())) return false;
        if (role && !a.field.toLowerCase().includes((role as string).toLowerCase())) return false;
        if (isOpenToMentoring !== undefined && a.is_open_to_mentoring !== (isOpenToMentoring === 'true')) return false;
        if (search) {
          const s = (search as string).toLowerCase();
          return (
            a.name.toLowerCase().includes(s) ||
            a.college.toLowerCase().includes(s) ||
            a.current_company.toLowerCase().includes(s) ||
            a.field.toLowerCase().includes(s)
          );
        }
        return true;
      });
    }

    return sendSuccess(res, { alumni: alumniList, count: alumniList.length });
  } catch (error) {
    console.error("Error fetching alumni directory:", error);
    return res.status(500).json({ error: "Internal server processing failure." });
  }
};

/**
 * Transition Profile from Student to Alumni & Mentorship Opt-in Status
 */
export const updateAlumniProfileStatus = async (req: Request, res: Response) => {
  const uid = req.user?.uid || req.user?.id || (req.user as any)?._id;
  const {
    graduation_year,
    graduationYear,
    current_company,
    currentCompany,
    alumni_status,
    alumniStatus,
    is_open_to_mentoring,
    isOpenToMentoring,
  } = req.body;

  const gradYear = graduation_year !== undefined ? graduation_year : graduationYear;
  const companyVal = current_company !== undefined ? current_company : currentCompany;
  const statusVal = alumni_status !== undefined ? alumni_status : alumniStatus;
  const mentoringVal = is_open_to_mentoring !== undefined ? is_open_to_mentoring : isOpenToMentoring;

  const updates: any = {};
  if (gradYear !== undefined) {
    updates.graduation_year = Number(gradYear);
    updates.graduationYear = Number(gradYear);
  }
  if (companyVal !== undefined) {
    updates.current_company = String(companyVal).trim();
    updates.currentCompany = String(companyVal).trim();
  }
  if (statusVal !== undefined) {
    if (!['student', 'alumni'].includes(statusVal)) {
      throw AppError.badRequest("Invalid alumni status value. Expected 'student' or 'alumni'");
    }
    updates.alumni_status = statusVal;
    updates.alumniStatus = statusVal;
  }
  if (mentoringVal !== undefined) {
    updates.is_open_to_mentoring = Boolean(mentoringVal);
    updates.isOpenToMentoring = Boolean(mentoringVal);
  }

  if (dbCommand && uid) {
    await dbCommand.collection("users").updateOne(
      { $or: [{ uid }, { id: uid }, { _id: safeObjectId(uid) }] },
      { $set: updates },
      { upsert: true }
    );
  }

  return sendSuccess(res, { message: "Alumni profile status updated successfully.", profile: updates });
};
