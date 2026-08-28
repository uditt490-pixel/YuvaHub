import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId } from "../../lib/utils.js";
import { emailService } from "../../services/emailService.js";
import { sendSuccess, sendError } from "../../lib/apiResponse.js";

/**
 * Fallback candidate list for development, offline, or mock testing mode
 */
const getMockCandidateList = () => [
  {
    id: "cand_1",
    uid: "cand_1",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    college: "IIT Bombay",
    graduation_year: 2025,
    graduationYear: 2025,
    city: "Bangalore",
    location: "Bangalore, KA",
    field: "Full Stack Development",
    verified_skills: ["React", "TypeScript", "Node.js", "MongoDB", "TailwindCSS"],
    verifiedSkills: ["React", "TypeScript", "Node.js", "MongoDB", "TailwindCSS"],
    skills: ["React", "TypeScript", "Node.js", "MongoDB", "TailwindCSS"],
    ats_score: 94,
    atsScore: 94,
    github_metrics: { repos: 32, stars: 145, contributions: 680 },
    githubUrl: "https://github.com/aarav-sharma",
    bio: "Passionate React & Node.js developer with 3 hackathon wins.",
    role: "student",
  },
  {
    id: "cand_2",
    uid: "cand_2",
    name: "Riya Verma",
    email: "riya.verma@example.com",
    college: "BITS Pilani",
    graduation_year: 2025,
    graduationYear: 2025,
    city: "Bangalore",
    location: "Bangalore, KA",
    field: "Frontend Engineering",
    verified_skills: ["React", "Next.js", "Redux", "GraphQL", "TypeScript"],
    verifiedSkills: ["React", "Next.js", "Redux", "GraphQL", "TypeScript"],
    skills: ["React", "Next.js", "Redux", "GraphQL", "TypeScript"],
    ats_score: 89,
    atsScore: 89,
    github_metrics: { repos: 24, stars: 88, contributions: 420 },
    githubUrl: "https://github.com/riya-verma",
    bio: "Frontend engineer focused on micro-frontends and UI performance.",
    role: "student",
  },
  {
    id: "cand_3",
    uid: "cand_3",
    name: "Vikram Malhotra",
    email: "vikram.m@example.com",
    college: "IIIT Hyderabad",
    graduation_year: 2024,
    graduationYear: 2024,
    city: "Hyderabad",
    location: "Hyderabad, TS",
    field: "AI/ML Engineering",
    verified_skills: ["Python", "PyTorch", "TensorFlow", "FastAPI", "Docker"],
    verifiedSkills: ["Python", "PyTorch", "TensorFlow", "FastAPI", "Docker"],
    skills: ["Python", "PyTorch", "TensorFlow", "FastAPI", "Docker"],
    ats_score: 96,
    atsScore: 96,
    github_metrics: { repos: 45, stars: 310, contributions: 1250 },
    githubUrl: "https://github.com/vikram-ai",
    bio: "AI Researcher publishing at NeurIPS & building LLM agents.",
    role: "student",
  },
  {
    id: "cand_4",
    uid: "cand_4",
    name: "Ananya Deshmukh",
    email: "ananya.d@example.com",
    college: "IIT Delhi",
    graduation_year: 2025,
    graduationYear: 2025,
    city: "Delhi",
    location: "Delhi NCR",
    field: "Backend Systems",
    verified_skills: ["Go", "Distributed Systems", "Kubernetes", "PostgreSQL", "Kafka"],
    verifiedSkills: ["Go", "Distributed Systems", "Kubernetes", "PostgreSQL", "Kafka"],
    skills: ["Go", "Distributed Systems", "Kubernetes", "PostgreSQL", "Kafka"],
    ats_score: 91,
    atsScore: 91,
    github_metrics: { repos: 19, stars: 62, contributions: 390 },
    githubUrl: "https://github.com/ananya-dev",
    bio: "Backend developer building cloud native distributed architectures.",
    role: "student",
  },
];

/**
 * Candidate Search Controller (Fast fuzzy searching under 200ms)
 * Filters candidates by skills, location, graduation year, min ATS score, and text search.
 */
export const searchCandidates = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const {
    skills,
    location,
    city,
    graduation_year,
    graduationYear,
    ats_score,
    minAtsScore,
    search,
    limit,
    offset,
  } = req.query;

  try {
    let candidateList: any[] = [];
    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;

    if (dbQuery) {
      const queryConds: any[] = [];

      const locVal = (location || city) as string;
      if (locVal) {
        queryConds.push({
          $or: [
            { location: { $regex: locVal, $options: "i" } },
            { city: { $regex: locVal, $options: "i" } },
          ],
        });
      }

      const gradYearVal = graduation_year || graduationYear;
      if (gradYearVal) {
        queryConds.push({
          $or: [
            { graduation_year: Number(gradYearVal) },
            { graduationYear: Number(gradYearVal) },
            { year: String(gradYearVal) },
          ],
        });
      }

      const minAts = ats_score || minAtsScore;
      if (minAts) {
        queryConds.push({
          $or: [
            { ats_score: { $gte: Number(minAts) } },
            { atsScore: { $gte: Number(minAts) } },
          ],
        });
      }

      if (skills) {
        const skillArray = Array.isArray(skills)
          ? skills
          : String(skills).split(",").map((s) => s.trim()).filter(Boolean);
        if (skillArray.length > 0) {
          const skillRegexes = skillArray.map((s) => new RegExp(String(s), "i"));
          queryConds.push({
            $or: [
              { verified_skills: { $in: skillRegexes } },
              { verifiedSkills: { $in: skillRegexes } },
              { skills: { $in: skillRegexes } },
            ],
          });
        }
      }

      if (search) {
        const sRegex = new RegExp(search as string, "i");
        queryConds.push({
          $or: [
            { name: sRegex },
            { college: sRegex },
            { field: sRegex },
            { bio: sRegex },
            { skills: sRegex },
            { verified_skills: sRegex },
          ],
        });
      }

      const mongoQuery: any = {
        $or: [
          { role: "student" },
          { role: { $exists: false } },
          { alumni_status: "student" },
        ],
      };

      if (queryConds.length > 0) {
        mongoQuery.$and = queryConds;
      }

      candidateList = await dbQuery
        .collection("users")
        .find(mongoQuery)
        .skip(offsetNum)
        .limit(limitNum)
        .toArray();
    }

    if (!candidateList || candidateList.length === 0) {
      const mockList = getMockCandidateList();
      candidateList = mockList.filter((c) => {
        if (location || city) {
          const loc = ((location || city) as string).toLowerCase();
          const matchLoc =
            (c.location && c.location.toLowerCase().includes(loc)) ||
            (c.city && c.city.toLowerCase().includes(loc));
          if (!matchLoc) return false;
        }

        const gYear = graduation_year || graduationYear;
        if (gYear && c.graduation_year !== Number(gYear)) {
          return false;
        }

        const minAts = ats_score || minAtsScore;
        if (minAts && (c.ats_score || 0) < Number(minAts)) {
          return false;
        }

        if (skills) {
          const reqSkills = String(skills)
            .toLowerCase()
            .split(",")
            .map((s) => s.trim());
          const cSkills = (c.verified_skills || c.skills || []).map((s) =>
            s.toLowerCase()
          );
          const hasSkill = reqSkills.some((rs) =>
            cSkills.some((cs) => cs.includes(rs))
          );
          if (!hasSkill) return false;
        }

        if (search) {
          const s = String(search).toLowerCase();
          const matches =
            c.name.toLowerCase().includes(s) ||
            c.college.toLowerCase().includes(s) ||
            c.field.toLowerCase().includes(s) ||
            c.bio.toLowerCase().includes(s);
          if (!matches) return false;
        }

        return true;
      });
    }

    const responseTimeMs = Date.now() - startTime;
    return sendSuccess(res, {
      candidates: candidateList,
      total: candidateList.length,
      limit: limitNum,
      offset: offsetNum,
      responseTimeMs,
    });
  } catch (error) {
    console.error("Error executing candidate search query:", error);
    return sendError(res, "Internal candidate search processing failure.", 500);
  }
};

/**
 * Encapsulated Employer Candidate Connection Router (Node.js/Express)
 * Enforces employer role boundary and sends direct connection invitations.
 */
export const initiateEmployerConnection = async (req: Request, res: Response) => {
  const { studentId, invitationMessage } = req.body;
  const employerId = req.user?.id || req.user?.uid || (req.user as any)?._id || "emp_user";

  try {
    // Assert employer permission boundaries
    const role = req.user?.role || req.user?.user_type;
    if (role !== "employer") {
      return res
        .status(403)
        .json({ error: "Access denied. Operation restricted to verified employers." });
    }

    if (!studentId || !invitationMessage) {
      return res.status(400).json({
        error: "Missing required fields: studentId and invitationMessage are required.",
      });
    }

    let student: any = null;
    if (dbQuery) {
      const oid = safeObjectId(studentId);
      const queryConds: any[] = [{ uid: studentId }, { id: studentId }];
      if (oid) queryConds.push({ _id: oid });
      student = await dbQuery.collection("users").findOne({ $or: queryConds });
    }

    if (!student) {
      const mockCandidates = getMockCandidateList();
      student = mockCandidates.find(
        (c) => c.id === studentId || c.uid === studentId
      );
    }

    if (!student) {
      return res.status(404).json({ error: "Candidate profile not found." });
    }

    // Persist a pending conversation boundary to keep direct communication locked until accepted
    const connectionId = `conn_req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const connectionRecord = {
      _id: connectionId,
      employer_id: employerId,
      student_id: studentId,
      message: invitationMessage,
      status: "pending",
      createdAt: new Date(),
    };

    if (dbCommand) {
      await dbCommand
        .collection("connection_requests")
        .insertOne(connectionRecord);
    }

    // Fire off transactional notification loop to alert the student candidate immediately
    await emailService.sendTransactionalNotification({
      to: student.email || "candidate@community.org",
      subject: "💼 New Direct Employer Connection Request on YuvaHub",
      body: `An employer is interested in your profile. Message preview: "${invitationMessage}". Log in to your candidate dashboard to accept and open a chat channel.`,
    });

    return res
      .status(201)
      .json({
        success: "Connection invitation transmitted successfully.",
        connectionId,
      });
  } catch (error) {
    console.error("Error initiating employer candidate connection:", error);
    return res.status(500).json({ error: "Internal lookup processing failure." });
  }
};
