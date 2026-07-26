/**
 * Application Service
 *
 * Handles:
 * - Creating applications
 * - User confirmation
 * - Submission lifecycle
 * - Retry handling
 * - Audit tracking
 */

import { ObjectId } from "mongodb";
import {
  getCommandDB,
} from "../lib/mongodb";

import {
  ApplicationDocument,
  ApplicationStatus,
  createApplicationDocument,
  addApplicationAuditLog,
} from "../models/applicationSchema";

const COLLECTION = "applications";

// Strict state transition machine rules
const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  draft: ["pending_confirmation", "queued"],
  pending_confirmation: ["queued", "draft", "failed"],
  queued: ["submitting", "failed"],
  submitting: ["submitted", "failed"],
  failed: ["retrying", "draft"],
  retrying: ["submitting", "failed"],
  submitted: [], // final state
};

export async function createApplication(
  data: Partial<ApplicationDocument>
) {
  const db = await getCommandDB();

  if (!data.userId || !data.opportunityId) {
    throw new Error("Missing required fields: userId, opportunityId");
  }

  // 1. Check for duplicate applications
  const existing = await db.collection(COLLECTION).findOne({
    userId: data.userId,
    opportunityId: data.opportunityId
  });
  if (existing) {
    throw new Error("Duplicate application: You have already submitted an application for this opportunity.");
  }

  // 2. Validate opportunity exists and is active/accepting applications
  let oppQuery: any = { id: data.opportunityId };
  if (ObjectId.isValid(data.opportunityId)) {
    oppQuery = { _id: new ObjectId(data.opportunityId) };
  }
  const opportunity = await db.collection("opportunities").findOne(oppQuery);
  if (!opportunity) {
    throw new Error("Opportunity not found");
  }
  if (opportunity.status === "closed") {
    throw new Error("This opportunity is closed and is no longer accepting applications.");
  }
  if (opportunity.deadline) {
    const deadlineDate = new Date(opportunity.deadline);
    if (!isNaN(deadlineDate.getTime()) && deadlineDate < new Date()) {
      throw new Error("The deadline for this opportunity has already passed.");
    }
  }

  const application = createApplicationDocument(data);

  const result = await db
    .collection(COLLECTION)
    .insertOne({
      ...application,
      _id: undefined,
    });

  return {
    id: result.insertedId.toString(),
    application,
  };
}

export async function confirmApplication(
  applicationId: string
) {
  const db = await getCommandDB();

  const application =
    await db
      .collection<ApplicationDocument>(COLLECTION)
      .findOne({
        _id: applicationId as any,
      });

  if (!application) {
    throw new Error("Application not found");
  }

  // State machine validation
  const currentStatus = application.status;
  if (currentStatus !== "pending_confirmation" && currentStatus !== "draft") {
    throw new Error(`Invalid status transition: cannot confirm application in "${currentStatus}" status.`);
  }

  const updated =
    addApplicationAuditLog(
      application,
      {
        action: "CONFIRMED",
        timestamp: new Date(),
        message: "User confirmed application submission",
      }
    );

  await db
    .collection(COLLECTION)
    .updateOne(
      {
        _id: applicationId as any,
      },
      {
        $set: {
          status: "queued",
          userConfirmed: true,
          auditLogs: updated.auditLogs,
          updatedAt: new Date(),
        },
      }
    );

  return updated;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  message?: string
) {
  const db = await getCommandDB();

  const application =
    await db
      .collection<ApplicationDocument>(COLLECTION)
      .findOne({
        _id: applicationId as any,
      });

  if (!application) {
    throw new Error("Application not found");
  }

  // Enforce strict state machine transitions
  const currentStatus = application.status;
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(status) && currentStatus !== status) {
    throw new Error(`Invalid status transition: cannot change status from "${currentStatus}" to "${status}".`);
  }

  const auditLog = {
    action:
      status === "submitted"
        ? "SUBMITTED"
        : status === "failed"
        ? "FAILED"
        : "SUBMISSION_STARTED" as any,

    timestamp: new Date(),

    message:
      message ||
      `Application status changed to ${status}`,
  };

  await db
    .collection(COLLECTION)
    .updateOne(
      {
        _id: applicationId as any,
      },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },

        $push: {
          auditLogs: auditLog,
        } as any,
      }
    );

  return true;
}

export async function retryApplication(
  applicationId: string
) {
  const db = await getCommandDB();

  const application =
    await db
      .collection<ApplicationDocument>(COLLECTION)
      .findOne({
        _id: applicationId as any,
      });

  if (!application) {
    throw new Error("Application not found");
  }

  // State machine validation: retry is only allowed from failed state
  const currentStatus = application.status;
  if (currentStatus !== "failed") {
    throw new Error(`Invalid status transition: cannot retry application in "${currentStatus}" status. Retry is only allowed for failed applications.`);
  }

  await db
    .collection(COLLECTION)
    .updateOne(
      {
        _id: applicationId as any,
      },
      {
        $set: {
          status: "retrying",
          updatedAt: new Date(),
        },

        $inc: {
          retryCount: 1,
        },

        $push: {
          auditLogs: {
            action: "RETRY_TRIGGERED",
            timestamp: new Date(),
            message: "Retry requested",
          },
        } as any,
      }
    );

  return true;
}

export async function getApplicationHistory(
  userId: string
) {
  const db = await getCommandDB();

  return db
    .collection(COLLECTION)
    .find({
      userId,
    })
    .sort({
      createdAt: -1,
    })
    .toArray();
}