import { Request, Response } from "express";
import { EndorsementService } from "../services/endorsementService.js";
import { sendSuccess } from "../../lib/apiResponse.js";
import { AppError } from "../../lib/AppError.js";

export const endorseSkill = async (req: Request, res: Response) => {
  const user = req.user;
  const { targetUid, skill } = req.body;

  if (!targetUid || !skill) {
    throw AppError.badRequest("targetUid and skill are required");
  }

  await EndorsementService.endorseSkill(user.uid, targetUid, skill);
  return sendSuccess(res, { message: "Endorsement added successfully." });
};

export const retractEndorsement = async (req: Request, res: Response) => {
  const user = req.user;
  const { targetUid, skill } = req.body;

  if (!targetUid || !skill) {
    throw AppError.badRequest("targetUid and skill are required");
  }

  await EndorsementService.retractEndorsement(user.uid, targetUid, skill);
  return sendSuccess(res, { message: "Endorsement retracted successfully." });
};

export const getEndorsements = async (req: Request, res: Response) => {
  // Can get for self or for another user if uid provided
  const uid = req.query.uid ? String(req.query.uid) : req.user.uid;
  const summary = await EndorsementService.getEndorsementSummary(uid);
  return sendSuccess(res, summary);
};
