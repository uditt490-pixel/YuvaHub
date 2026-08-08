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

import {
  getCommandDB,
} from "../lib/mongodb";

import {
  ApplicationDocument,
  createApplicationDocument,
  addApplicationAuditLog,
} from "../models/applicationSchema";


const COLLECTION = "applications";


export async function createApplication(
  data: Partial<ApplicationDocument>
) {

  const db = await getCommandDB();

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
  status: ApplicationDocument["status"],
  message?: string
) {
  const db = await getCommandDB();

  const auditAction =
    status === "submitted"
      ? "SUBMITTED"
      : status === "failed"
        ? "FAILED"
        : status === "retrying"
          ? "RETRY_TRIGGERED"
          : "SUBMISSION_STARTED";

  const auditLog = {
    action: auditAction,
    timestamp: new Date(),
    message:
      message || `Application status changed to ${status}`,
  };

  const result = await db
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

  if (result.matchedCount === 0) {
    throw new Error("Application not found");
  }

  return true;
}

export async function updateApplicationTracker(
  applicationId: string,
  userId: string,
  updates: {
    status?: ApplicationDocument["status"];
    notes?: string;
    deadline?: Date | string;
  }
) {
  const db = await getCommandDB();

  const updateData: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (updates.status !== undefined) {
    updateData.status = updates.status;
  }

  if (updates.notes !== undefined) {
    updateData.notes = updates.notes;
  }

  if (updates.deadline !== undefined) {
    updateData.deadline = updates.deadline;
  }

  const result = await db
    .collection(COLLECTION)
    .updateOne(
      {
        _id: applicationId as any,
        userId,
      },
      {
        $set: updateData,
      }
    );

  if (result.matchedCount === 0) {
    throw new Error("Application not found");
  }

  return true;
}





export async function retryApplication(
  applicationId: string
) {

  const db = await getCommandDB();


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
  userId: string,
  filters?: {
    status?: ApplicationDocument["status"];
    opportunityId?: string;
  }
) {
  const db = await getCommandDB();

  const query: Record<string, any> = {
    userId,
  };

  if (filters?.status) {
    query.status = filters.status;
  }

  if (filters?.opportunityId) {
    query.opportunityId = filters.opportunityId;
  }

  return db
    .collection(COLLECTION)
    .find(query)
    .sort({
      createdAt: -1,
    })
    .toArray();
}