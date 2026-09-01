import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { ObjectId } from "mongodb";
import { generateApplicationDraft } from "../../services/applicationGenerator.js";
import { addApplicationJob } from "../../queues/applicationQueue.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess } from "../../lib/apiResponse.js";
import { safeObjectId } from "../../lib/utils.js";
import { ApplicationDocument, ApplicationDocumentSchema } from "../../models/applicationSchema.js";

// In-memory store for fallback/tests
export const MEMORY_APPLICATIONS: ApplicationDocument[] = [];

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

export const createApplication = async (req: Request, res: Response) => {
  const userId = req.user?.uid || req.body.userId;
  if (!userId) {
    throw AppError.unauthorized("User must be logged in");
  }

  const { opportunityId, opportunity, status, notes, deadline } = req.body;
  if (!opportunityId || !opportunity?.title) {
    throw AppError.badRequest("opportunityId and opportunity.title are required");
  }

  const now = new Date();
  const parsedDoc = ApplicationDocumentSchema.safeParse({
    userId,
    opportunityId,
    opportunity: {
      title: opportunity.title,
      organization: opportunity.organization || opportunity.org || "",
      platform: opportunity.platform || "YuvaHub",
      applyUrl: opportunity.applyUrl || opportunity.apply_link || "",
      type: opportunity.type || "",
      location: opportunity.location || "",
      deadline: opportunity.deadline || "",
    },
    status: status || "saved",
    notes: notes || "",
    deadline: deadline ? new Date(deadline) : undefined,
    auditLogs: [
      {
        action: "CREATED",
        timestamp: now,
        message: `Saved to application tracker with status: ${status || "saved"}`,
      }
    ],
    createdAt: now,
    updatedAt: now,
  });

  if (!parsedDoc.success) {
    throw AppError.badRequest(parsedDoc.error.issues[0]?.message || "Invalid application payload");
  }

  const applicationData = parsedDoc.data;

  if (!dbCommand) {
    const memId = `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const docWithId = { ...applicationData, _id: memId };
    MEMORY_APPLICATIONS.unshift(docWithId);
    return sendSuccess(res, { application: docWithId, message: "Application saved to tracker" }, 201);
  }

  // Check if application for this user and opportunity already exists
  const existing = await dbQuery?.collection("applications").findOne({
    userId,
    opportunityId
  });

  if (existing) {
    // Update existing application
    const updated = await dbCommand.collection("applications").findOneAndUpdate(
      { _id: existing._id },
      {
        $set: {
          status: status || existing.status || "saved",
          notes: notes !== undefined ? notes : existing.notes,
          updatedAt: now
        },
        $push: {
          auditLogs: {
            action: "UPDATED",
            timestamp: now,
            message: `Updated status to ${status || existing.status}`,
          }
        } as any
      },
      { returnDocument: "after" }
    );
    return sendSuccess(res, { application: updated || existing, message: "Application updated in tracker" });
  }

  const result = await dbCommand.collection("applications").insertOne(applicationData);
  const createdApp = { ...applicationData, _id: result.insertedId.toString() };

  return sendSuccess(res, { application: createdApp, message: "Application saved to tracker" }, 201);
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes, deadline } = req.body;
  const userId = req.user?.uid || req.body.userId;

  if (!userId) {
    throw AppError.unauthorized("User must be logged in");
  }

  if (!status && notes === undefined && deadline === undefined) {
    throw AppError.badRequest("Status, notes, or deadline is required");
  }

  const now = new Date();

  if (!dbCommand) {
    const found = MEMORY_APPLICATIONS.find(app => (app._id === id || (app as any).id === id) && app.userId === userId);
    if (!found) {
      throw AppError.notFound("Application not found or unauthorized");
    }
    if (status) found.status = status;
    if (notes !== undefined) found.notes = notes;
    if (deadline !== undefined) found.deadline = deadline ? new Date(deadline) : undefined;
    found.updatedAt = now;
    found.auditLogs.push({
      action: "UPDATED",
      timestamp: now,
      message: `Updated via tracker`,
    });
    return sendSuccess(res, { application: found, message: "Application updated successfully" });
  }

  const oid = safeObjectId(id);
  const query = oid ? { _id: oid, userId } : { _id: id as any, userId };

  const updateFields: Record<string, any> = { updatedAt: now };
  if (status) updateFields.status = status;
  if (notes !== undefined) updateFields.notes = notes;
  if (deadline !== undefined) updateFields.deadline = deadline ? new Date(deadline) : null;

  const result = await dbCommand.collection("applications").updateOne(
    query,
    {
      $set: updateFields,
      $push: {
        auditLogs: {
          action: "UPDATED",
          timestamp: now,
          message: `Updated status: ${status || 'unchanged'} via Kanban board`,
        }
      } as any
    }
  );

  if (result.matchedCount === 0) {
    throw AppError.notFound("Application not found or unauthorized");
  }

  return sendSuccess(res, { message: "Status updated successfully" });
};

export const updateApplication = async (req: Request, res: Response) => {
  return updateApplicationStatus(req, res);
};

export const deleteApplication = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.uid || req.body?.userId;

  if (!userId) {
    throw AppError.unauthorized("User must be logged in");
  }

  if (!dbCommand) {
    const idx = MEMORY_APPLICATIONS.findIndex(app => (app._id === id || (app as any).id === id) && app.userId === userId);
    if (idx === -1) {
      throw AppError.notFound("Application not found or unauthorized");
    }
    MEMORY_APPLICATIONS.splice(idx, 1);
    return sendSuccess(res, { message: "Application removed from tracker" });
  }

  const oid = safeObjectId(id);
  const query = oid ? { _id: oid, userId } : { _id: id as any, userId };

  const result = await dbCommand.collection("applications").deleteOne(query);

  if (result.deletedCount === 0) {
    throw AppError.notFound("Application not found or unauthorized");
  }

  return sendSuccess(res, { message: "Application removed from tracker" });
};

export const getUserApplications = async (req: Request, res: Response) => {
  const userId = req.user?.uid;

  if (!userId) {
    throw AppError.unauthorized("User must be logged in");
  }

  const statusFilter = req.query.status as string;

  if (!dbQuery) {
    let filtered = MEMORY_APPLICATIONS.filter(app => app.userId === userId);
    if (statusFilter && statusFilter !== "All") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    return sendSuccess(res, { applications: filtered });
  }

  const query: Record<string, any> = { userId };
  if (statusFilter && statusFilter !== "All") {
    query.status = statusFilter;
  }

  const applications = await dbQuery.collection("applications")
    .find(query)
    .sort({ updatedAt: -1 })
    .toArray();

  const mapped = applications.map((doc: any) => {
    const id = doc._id ? doc._id.toString() : doc.id;
    return { ...doc, _id: id, id };
  });

  return sendSuccess(res, { applications: mapped });
};

