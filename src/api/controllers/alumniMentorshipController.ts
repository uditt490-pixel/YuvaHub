import { Request, Response } from "express";
import { AlumniMentorshipEngine } from "../../services/alumniMentorshipEngine.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess } from "../../lib/apiResponse.js";

export const getAlumniMentorshipSlots = async (req: Request, res: Response) => {
  const campusName = (req.query.campusName as string) || undefined;
  const expertiseArea = (req.query.expertiseArea as string) || undefined;
  const status = (req.query.status as string) || undefined;
  const search = (req.query.search as string) || undefined;

  const slots = await AlumniMentorshipEngine.getSlots({
    campusName,
    expertiseArea,
    status,
    search,
  });

  return sendSuccess(res, { slots, count: slots.length });
};

export const registerAlumniMentorshipSlot = async (req: Request, res: Response) => {
  const {
    mentorName,
    mentorAlumniBatchYear,
    mentorCurrentCompany,
    mentorCurrentRole,
    campusName,
    expertiseArea,
    availableSessionsCount,
    sessionTopics,
    matchingCompatibilityPercent,
  } = req.body;

  if (
    !mentorName ||
    !mentorAlumniBatchYear ||
    !mentorCurrentCompany ||
    !mentorCurrentRole ||
    !campusName ||
    !expertiseArea ||
    !availableSessionsCount ||
    !sessionTopics
  ) {
    throw AppError.badRequest("Missing required mentor slot registration fields");
  }

  const slot = await AlumniMentorshipEngine.registerSlot({
    mentorName,
    mentorAlumniBatchYear: Number(mentorAlumniBatchYear),
    mentorCurrentCompany,
    mentorCurrentRole,
    campusName,
    expertiseArea,
    availableSessionsCount: Number(availableSessionsCount),
    sessionTopics,
    matchingCompatibilityPercent:
      matchingCompatibilityPercent !== undefined
        ? Number(matchingCompatibilityPercent)
        : undefined,
  });

  return sendSuccess(res, { slot }, 201);
};

export const bookAlumniMentorshipSession = async (req: Request, res: Response) => {
  const slotId = (req.params.slotId as string) || (req.body.slotId as string);
  const studentId =
    (req.user?.uid as string) || (req.body.studentId as string) || "STU-DEMO";
  const studentName =
    (req.user?.name as string) || (req.body.studentName as string) || "Student";

  if (!slotId) {
    throw AppError.badRequest("Missing slotId parameter");
  }

  const bookedSlot = await AlumniMentorshipEngine.bookSession(
    slotId as string,
    studentId,
    studentName
  );

  if (!bookedSlot) {
    throw AppError.badRequest("Mentorship slot not found or no available sessions");
  }

  return sendSuccess(res, {
    slot: bookedSlot,
    message: "Mentorship session booked successfully",
  });
};
