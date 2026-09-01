import type { Collection } from "mongodb";

export const DEADLINE_REMINDER_WINDOWS = {
  SEVEN_DAYS: "7d",
  THREE_DAYS: "3d",
  FORTY_EIGHT_HOURS: "48h",
  ONE_DAY: "1d",
  SAME_DAY: "0d",
} as const;

export type DeadlineReminderWindow =
  (typeof DEADLINE_REMINDER_WINDOWS)[keyof typeof DEADLINE_REMINDER_WINDOWS];

export const DEADLINE_REMINDER_INDEX = "deadline_reminder_dedupe_key_unique";

/**
 * Generates the stable cross-process key used to deduplicate deadline reminders.
 * It deliberately does not include notification copy/title so wording changes
 * cannot cause another reminder for the same window.
 */
export function buildDeadlineReminderDedupeKey(
  userId: string,
  opportunityId: string,
  reminderWindow: DeadlineReminderWindow,
): string {
  return `deadline:${userId}:${opportunityId}:${reminderWindow}`;
}

/**
 * The partial unique index lets legacy notifications without dedupeKey remain
 * readable while guaranteeing uniqueness for all new atomic deadline reminders.
 */
export async function ensureDeadlineReminderIndex(db: any): Promise<void> {
  await db.collection("notifications").createIndex(
    { dedupeKey: 1 },
    {
      name: DEADLINE_REMINDER_INDEX,
      unique: true,
      partialFilterExpression: { dedupeKey: { $exists: true } },
    },
  );
}

export interface DeadlineReminderDocument {
  userId: string;
  type: "deadline_reminder";
  title: string;
  message: string;
  targetId: string;
  dedupeKey: string;
  read: boolean;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Atomically claims a reminder slot. Only the MongoDB operation that performs
 * the upsert can win. A concurrent duplicate-key conflict is an expected
 * "already claimed" result and is intentionally converted to false.
 */
export async function createDeadlineReminderAtomically(
  collection: Collection<DeadlineReminderDocument> | any,
  document: DeadlineReminderDocument,
): Promise<boolean> {
  try {
    const result = await collection.updateOne(
      { dedupeKey: document.dedupeKey },
      { $setOnInsert: document },
      { upsert: true },
    );

    return result.upsertedCount === 1;
  } catch (error: any) {
    if (error?.code === 11000 || error?.codeName === "DuplicateKey") {
      return false;
    }
    throw error;
  }
}
