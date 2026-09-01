import { ObjectId } from "mongodb";
import { enqueueEmail } from "../queues/emailQueue";
import { enqueuePushNotification } from "../queues/pushQueue";
import { getSocketIO } from "../api/socketInstance.js";
import {
  generateDeadlineReminderHtml,
  generateWeeklyDigestHtml,
} from "../workers/emailTemplates";
import {
  buildDeadlineReminderDedupeKey,
  createDeadlineReminderAtomically,
  DEADLINE_REMINDER_WINDOWS,
  ensureDeadlineReminderIndex,
  type DeadlineReminderWindow,
  type DeadlineReminderDocument,
} from "./deadlineReminderAtomic";

const DAY_MS = 24 * 60 * 60 * 1000;

function getReminderWindow(diffDays: number): DeadlineReminderWindow | null {
  switch (diffDays) {
    case 7:
      return DEADLINE_REMINDER_WINDOWS.SEVEN_DAYS;
    case 3:
      return DEADLINE_REMINDER_WINDOWS.THREE_DAYS;
    case 2:
      return DEADLINE_REMINDER_WINDOWS.FORTY_EIGHT_HOURS;
    case 1:
      return DEADLINE_REMINDER_WINDOWS.ONE_DAY;
    case 0:
      return DEADLINE_REMINDER_WINDOWS.SAME_DAY;
    default:
      return null;
  }
}

function getReminderCopy(
  opportunityTitle: string,
  deadline: Date,
  diffDays: number,
): { title: string; message: string } {
  if (diffDays === 2) {
    return {
      title: "Deadline in 48 Hours (~2 Days)!",
      message: `48-Hour Reminder: The deadline for bookmarked opportunity "${opportunityTitle}" is in 2 days (${deadline.toLocaleDateString()}).`,
    };
  }

  if (diffDays === 1) {
    return {
      title: "Deadline Tomorrow!",
      message: `Urgent Reminder: The deadline for bookmarked opportunity "${opportunityTitle}" is tomorrow (${deadline.toLocaleDateString()}).`,
    };
  }

  if (diffDays === 0) {
    return {
      title: "Deadline is TODAY!",
      message: `Urgent Reminder: Today is the last day to apply for bookmarked opportunity "${opportunityTitle}".`,
    };
  }

  return {
    title: `Deadline approaching in ${diffDays} days!`,
    message: `Reminder: The deadline for bookmarked opportunity "${opportunityTitle}" is in ${diffDays} days (${deadline.toLocaleDateString()}).`,
  };
}

function getOpportunityIds(bookmarks: unknown[]): {
  stringIds: string[];
  objectIds: ObjectId[];
} {
  const stringIds: string[] = [];
  const objectIds: ObjectId[] = [];

  for (const bookmark of bookmarks) {
    if (!bookmark) continue;

    const id = String(bookmark);
    stringIds.push(id);

    if (ObjectId.isValid(id)) {
      try {
        objectIds.push(new ObjectId(id));
      } catch {
        // The string id remains usable through the `id` query.
      }
    }
  }

  return { stringIds, objectIds };
}

/**
 * Runs the deadline reminder scan.
 *
 * Reminder creation is deliberately split into two phases:
 * 1. Determine whether an opportunity is currently in a supported reminder window.
 * 2. Atomically claim that reminder window in MongoDB using the unique dedupeKey.
 *
 * Only the process that successfully performs the upsert is allowed to emit
 * socket/email/push side effects. This makes concurrent scheduler executions
 * safe across multiple application instances.
 */
export async function runDeadlineChecks(db: any): Promise<void> {
  if (!db) {
    console.error("[DeadlineScheduler] Database connection not available.");
    return;
  }

  console.log("[DeadlineScheduler] Starting daily deadline scan...");

  try {
    const usersCollection = db.collection("users");
    const oppsCollection = db.collection("opportunities");
    const notifCollection = db.collection("notifications");

    // The unique index is the actual cross-process synchronization primitive.
    // createIndex is idempotent, so this is safe across scheduler invocations.
    await ensureDeadlineReminderIndex(db);

    const users = await usersCollection
      .find({
        bookmarks: { $exists: true, $not: { $size: 0 } },
      })
      .toArray();

    const now = new Date();

    const activeUsers = users.filter((user: any) => {
      const prefs = user.notificationPreferences || {
        deadlineRemindersEnabled: true,
      };
      return prefs.deadlineRemindersEnabled !== false;
    });

    if (activeUsers.length === 0) {
      return;
    }

    // Fetch every bookmarked opportunity once for the complete scan.
    const uniqueOppIds = new Set<string>();

    for (const user of activeUsers) {
      for (const oppId of user.bookmarks || []) {
        if (oppId) uniqueOppIds.add(String(oppId));
      }
    }

    const oppMap = new Map<string, any>();

    if (uniqueOppIds.size > 0) {
      const { stringIds, objectIds } = getOpportunityIds(
        Array.from(uniqueOppIds),
      );

      const queryConditions: any[] = [{ id: { $in: stringIds } }];
      if (objectIds.length > 0) {
        queryConditions.push({ _id: { $in: objectIds } });
      }

      const opportunities = await oppsCollection
        .find({ $or: queryConditions })
        .toArray();

      for (const opportunity of opportunities) {
        if (opportunity._id) {
          oppMap.set(opportunity._id.toString(), opportunity);
        }
        if (opportunity.id) {
          oppMap.set(String(opportunity.id), opportunity);
        }
      }
    }

    for (const user of activeUsers) {
      const userId = user.uid || user._id?.toString() || user.id;
      if (!userId) continue;

      const prefs = user.notificationPreferences || {
        emailEnabled: true,
        pushEnabled: true,
        deadlineRemindersEnabled: true,
        skillAlertsEnabled: true,
        scholarshipAlertsEnabled: true,
        hackathonAlertsEnabled: true,
        opportunityAlertsEnabled: true,
      };

      const bookmarks = user.bookmarks || [];
      if (bookmarks.length === 0) continue;

      for (const oppId of bookmarks) {
        const oppIdStr = String(oppId);
        const opportunity = oppMap.get(oppIdStr);

        if (!opportunity) continue;

        const deadlineStr = opportunity.deadline;
        if (
          !deadlineStr ||
          String(deadlineStr).toLowerCase() === "tbd" ||
          String(deadlineStr).toLowerCase() === "rolling"
        ) {
          continue;
        }

        const deadline = new Date(deadlineStr);
        if (Number.isNaN(deadline.getTime())) continue;

        const timeDiff = deadline.getTime() - now.getTime();
        const diffDays = Math.floor(timeDiff / DAY_MS);
        const reminderWindow = getReminderWindow(diffDays);

        if (!reminderWindow) continue;

        const { title, message } = getReminderCopy(
          opportunity.title,
          deadline,
          diffDays,
        );

        // This key is stable across processes and independent of notification
        // copy. The same user/opportunity/window can therefore only be claimed once.
        const dedupeKey = buildDeadlineReminderDedupeKey(
          String(userId),
          oppIdStr,
          reminderWindow,
        );

        const notificationDoc: DeadlineReminderDocument = {
          userId: String(userId),
          type: "deadline_reminder",
          title,
          message,
          targetId: oppIdStr,
          dedupeKey,
          read: false,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 90 * DAY_MS),
        };

        let inserted = false;

        try {
          inserted = await createDeadlineReminderAtomically(
            notifCollection,
            notificationDoc,
          );
        } catch (error) {
          console.error(
            `[DeadlineScheduler] Failed to claim reminder ${dedupeKey}:`,
            error,
          );
          continue;
        }

        // A false result means another scheduler instance already won this
        // reminder window. Never emit any external side effect in that case.
        if (!inserted) {
          continue;
        }

        console.log(
          `[DeadlineScheduler] Reminded user ${userId} of deadline for opportunity ${oppIdStr} (${reminderWindow})`,
        );

        // Real-time Socket.io notification — only the atomic winner emits.
        const io = getSocketIO();
        if (io) {
          io.emit(`NOTIFICATION_RECEIVED_${userId}`, {
            id: dedupeKey,
            ...notificationDoc,
            time: "Just now",
          });
        }

        // Email — only queued after the notification was actually inserted.
        if (prefs.emailEnabled && user.email) {
          const html = generateDeadlineReminderHtml(
            opportunity.title,
            opportunity.company ||
              opportunity.organization ||
              "YuvaHub Partner",
            deadline.toLocaleDateString(),
            diffDays,
          );

          await enqueueEmail({
            to: user.email,
            subject: `[YuvaHub] ${title}: ${opportunity.title}`,
            body: message,
            html,
          });
        }

        // Push — only queued after the notification was actually inserted.
        if (prefs.pushEnabled && user.fcmToken) {
          await enqueuePushNotification({
            userId: String(userId),
            message: `[YuvaHub] ${title}: ${opportunity.title}`,
          });
        }
      }
    }
  } catch (err) {
    console.error(
      "[DeadlineScheduler] Error running deadline reminders check:",
      err,
    );
  }
}

/**
 * Weekly Summary Digest
 * Sends a weekly digest email to users summarizing all active bookmarks expiring in the next 7 days.
 *
 * This path is intentionally independent of deadline-reminder deduplication.
 */
export async function runWeeklyDigest(db: any): Promise<void> {
  if (!db) return;
  console.log("[DeadlineScheduler] Running weekly summary digest scan...");

  try {
    const usersCollection = db.collection("users");
    const oppsCollection = db.collection("opportunities");

    const users = await usersCollection
      .find({
        bookmarks: { $exists: true, $not: { $size: 0 } },
      })
      .toArray();

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * DAY_MS);

    const activeUsers = users.filter((user: any) => {
      if (!user.email) return false;
      const prefs = user.notificationPreferences || { emailEnabled: true };
      return prefs.emailEnabled !== false;
    });

    if (activeUsers.length === 0) return;

    const uniqueOppIds = new Set<string>();

    for (const user of activeUsers) {
      for (const oppId of user.bookmarks || []) {
        if (oppId) uniqueOppIds.add(String(oppId));
      }
    }

    const oppMap = new Map<string, any>();

    if (uniqueOppIds.size > 0) {
      const { stringIds, objectIds } = getOpportunityIds(
        Array.from(uniqueOppIds),
      );

      const queryConditions: any[] = [{ id: { $in: stringIds } }];
      if (objectIds.length > 0) {
        queryConditions.push({ _id: { $in: objectIds } });
      }

      const opportunities = await oppsCollection
        .find({ $or: queryConditions })
        .toArray();

      for (const opp of opportunities) {
        if (opp._id) oppMap.set(opp._id.toString(), opp);
        if (opp.id) oppMap.set(String(opp.id), opp);
      }
    }

    for (const user of activeUsers) {
      const bookmarks = user.bookmarks || [];
      const expiringOpps: Array<{
        title: string;
        org: string;
        deadline: string;
      }> = [];

      for (const oppId of bookmarks) {
        const opp = oppMap.get(String(oppId));

        if (!opp || !opp.deadline) continue;

        const deadline = new Date(opp.deadline);
        if (Number.isNaN(deadline.getTime())) continue;

        if (deadline >= now && deadline <= nextWeek) {
          expiringOpps.push({
            title: opp.title,
            org: opp.company || opp.organization || "",
            deadline: deadline.toLocaleDateString(),
          });
        }
      }

      if (expiringOpps.length > 0) {
        const html = generateWeeklyDigestHtml(
          user.name || "Student",
          expiringOpps,
        );

        await enqueueEmail({
          to: user.email,
          subject: `[YuvaHub] Your Weekly Bookmarks Summary Digest (${expiringOpps.length} Deadlines Closing Soon)`,
          body: `Hello ${user.name || "Student"}, you have ${expiringOpps.length} bookmarked opportunities with deadlines this week.`,
          html,
        });

        console.log(
          `[DeadlineScheduler] Sent weekly digest to ${user.email} with ${expiringOpps.length} opportunities.`,
        );
      }
    }
  } catch (err) {
    console.error("[DeadlineScheduler] Error running weekly digest:", err);
  }
}
