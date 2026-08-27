import { Request, Response } from "express";
import { StudentMentalWellnessEngine } from "../../services/mentalWellnessEngine.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess } from "../../lib/apiResponse.js";

export const getMentalWellnessCheckIns = async (req: Request, res: Response) => {
  const campusName = (req.query.campusName as string) || undefined;
  const stressLevel = (req.query.stressLevel as string) || undefined;
  const sessionStatus = (req.query.sessionStatus as string) || undefined;
  const search = (req.query.search as string) || undefined;

  const checkIns = await StudentMentalWellnessEngine.getCheckIns({
    campusName,
    stressLevel,
    sessionStatus,
    search,
  });

  return sendSuccess(res, { checkIns, count: checkIns.length });
};

export const createMentalWellnessCheckIn = async (req: Request, res: Response) => {
  const {
    studentId,
    studentName,
    campusName,
    moodRating,
    stressLevel,
    primaryStressor,
    supportRequested,
    confidentialNotes,
  } = req.body;

  if (
    !studentId ||
    !studentName ||
    !campusName ||
    moodRating === undefined ||
    !stressLevel ||
    !primaryStressor
  ) {
    throw AppError.badRequest("Missing required mental wellness check-in fields");
  }

  const checkIn = await StudentMentalWellnessEngine.createCheckIn({
    studentId,
    studentName,
    campusName,
    moodRating: Number(moodRating),
    stressLevel,
    primaryStressor,
    supportRequested: Boolean(supportRequested),
    confidentialNotes,
  });

  return sendSuccess(res, { checkIn }, 201);
};

export const assignCounselorCheckIn = async (req: Request, res: Response) => {
  const paramRecordId = req.params.checkInId;
  const bodyRecordId = req.body.checkInId;
  const checkInId = (Array.isArray(paramRecordId) ? paramRecordId[0] : paramRecordId) || (Array.isArray(bodyRecordId) ? bodyRecordId[0] : bodyRecordId) || (req.body.studentId as string);
  const counselorName =
    req.body.counselorName || req.body.counselorAssigned || "Dr. Ananya Verma (Clinical Psychologist)";

  if (!checkInId) {
    throw AppError.badRequest("Missing checkInId or studentId parameter");
  }

  const updatedCheckIn = await StudentMentalWellnessEngine.assignCounselor(
    checkInId as string,
    counselorName
  );

  if (!updatedCheckIn) {
    throw AppError.notFound("Mental wellness check-in record not found");
  }

  return sendSuccess(res, {
    checkIn: updatedCheckIn,
    message: "Counselor assigned and session scheduled successfully",
  });
};
