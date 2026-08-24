import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { ObjectId } from "mongodb";
import { generateApplicationDraft } from "../../services/applicationGenerator.js";
import { addApplicationJob } from "../../queues/applicationQueue.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess } from "../../lib/apiResponse.js";

export const generateDraft = async (req: Request, res: Response) => {
  const { opportunity, profile } = req.body;

  if (!opportunity?.title) {
    throw AppError.badRequest("Opportunity details required");
  }

  const draft = await generateApplicationDraft({
    opportunityTitle: opportunity.title,
    organization: opportunity.organization || opportunity.org,
    profile
  });

  return sendSuccess(res, { content: draft });
};

export const queueApplication = async (req: Request, res: Response) => {
  const job = await addApplicationJob({
    userId: req.body.userId,
    opportunityId: req.body.opportunityId,
    opportunityTitle: req.body.opportunityTitle,
    organization: req.body.organization,
    profile: req.body.profile,
    action: req.body.action || "generate_draft"
  });

  return sendSuccess(res, { jobId: job.id });
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user?.uid;

  if (!status) {
    throw AppError.badRequest("Status is required");
  }

  const result = await dbCommand.collection("applications").updateOne(
    { _id: new ObjectId(id as string), userId },
    {
      $set: { status, updatedAt: new Date() },
      $push: {
        auditLogs: {
          action: "UPDATED",
          timestamp: new Date(),
          message: `Status updated to ${status} via Kanban board`,
        }
      }
    }
  );

  if (result.matchedCount === 0) {
    throw AppError.notFound("Application not found or unauthorized");
  }

  return sendSuccess(res, { message: "Status updated successfully" });
};

export const getUserApplications = async (req: Request, res: Response) => {
  const userId = req.user?.uid;

  if (!userId) {
    throw AppError.unauthorized("User must be logged in");
  }

  const applications = await dbQuery.collection("applications")
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();

  return sendSuccess(res, { applications });
};
