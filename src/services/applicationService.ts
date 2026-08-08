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


  const auditLog = {
    action:
      status === "submitted"
        ? "SUBMITTED"
        : status === "failed"
        ? "FAILED"
        : "SUBMISSION_STARTED",

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