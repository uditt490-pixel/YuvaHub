import { getIsoWeek, getWeeklyDigestKey } from "../lib/dateUtils";

export interface DigestQueueResult {
  queued: boolean;
  dedupeKey: string;
  deliveryId?: string;
}

export interface DigestQueueJob {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

function isDuplicateKeyError(error: any): boolean {
  return error?.code === 11000 || error?.code === 11001;
}

/**
 * Atomically claims a weekly digest before the email queue is called.
 *
 * A new claim is inserted only once for a user/week. Failed queue attempts
 * are marked failed so a later scheduler execution can safely retry them.
 */
export async function enqueueWeeklyDigestIdempotently(
  db: any,
  userId: string,
  date: Date,
  job: DigestQueueJob,
  enqueue: (job: DigestQueueJob) => Promise<{ id?: string } | void>,
): Promise<DigestQueueResult> {
  if (!db) throw new Error("Database connection is required.");
  if (!userId) throw new Error("A stable userId is required.");

  const { year, week } = getIsoWeek(date);
  const dedupeKey = getWeeklyDigestKey(userId, date);
  const collection = db.collection("digestDeliveries");

  let claim: any;
  try {
    claim = await collection.findOneAndUpdate(
      {
        dedupeKey,
        $or: [
          { status: "failed" },
          { status: { $exists: false } },
        ],
      },
      {
        $setOnInsert: {
          dedupeKey,
          userId,
          isoYear: year,
          isoWeek: week,
          status: "queued",
          queuedAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { queued: false, dedupeKey };
    }
    throw error;
  }

  const document = claim?.value ?? claim;
  if (!document) return { queued: false, dedupeKey };

  // A pre-existing successful/queued claim belongs to another execution.
  if (document.dedupeKey === dedupeKey && document.status === "queued") {
    const isFreshClaim =
      document.queuedAt &&
      Math.abs(new Date(document.queuedAt).getTime() - Date.now()) < 5000;

    if (!isFreshClaim) {
      return { queued: false, dedupeKey, deliveryId: document._id?.toString() };
    }
  }

  try {
    const queued = await enqueue(job);
    const queueJobId =queued && typeof queued === 'object' ? queued.id : undefined;

    await collection.updateOne(
      { dedupeKey },
      {
        $set: {
          status: "queued",
          ...(queueJobId ? { queueJobId } : {}),
          updatedAt: new Date(),
        },
      },
    );

    return {
      queued: true,
      dedupeKey,
      deliveryId: document._id?.toString(),
    };
  } catch (error) {
    await collection.updateOne(
      { dedupeKey },
      {
        $set: {
          status: "failed",
          updatedAt: new Date(),
        },
      },
    );
    throw error;
  }
}
