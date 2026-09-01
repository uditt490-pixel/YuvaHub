import { Request, Response } from "express";
import { AlumniMentorshipEngine } from "../../services/alumniMentorshipEngine.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess } from "../../lib/apiResponse.js";

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
