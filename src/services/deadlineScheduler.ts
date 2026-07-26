import { ObjectId } from "mongodb";
import { enqueueEmail } from "../queues/emailQueue";
import { enqueuePushNotification } from "../queues/pushQueue";
import { Notification } from "../models/notificationSchema";
import { getSocketIO } from "../api/socketInstance.js";
import { generateDeadlineReminderHtml, generateWeeklyDigestHtml } from "../workers/emailTemplates";
import { redisClient } from "../api/redis.js";

async function acquireLock(key: string, ttlMs: number): Promise<boolean> {
  if (!(globalThis as any).REDIS_AVAILABLE || !redisClient) return true; // Fail-safe: allow if Redis is offline
  try {
    const res = await redisClient.set(key, "locked", "NX", "PX", ttlMs);
    return res === "OK";
  } catch (err: any) {
    console.error(`[DeadlineScheduler] Redis lock error for ${key}:`, err.message);
    return false;
  }
}

async function releaseLock(key: string): Promise<void> {
  if (!(globalThis as any).REDIS_AVAILABLE || !redisClient) return;
  try {
    await redisClient.del(key);
  } catch (err: any) {
    console.error(`[DeadlineScheduler] Redis unlock error for ${key}:`, err.message);
  }
}

function getDaysDifference(deadlineDateStr: string, timezoneOffsetMinutes: number = 0): number {
  const deadlineDate = new Date(deadlineDateStr);
  if (isNaN(deadlineDate.getTime())) return -1;

  const now = new Date();
  
  // Adjust both dates by the user's timezone offset to shift them to the user's local day
  const userNow = new Date(now.getTime() + timezoneOffsetMinutes * 60 * 1000);
  const userDeadline = new Date(deadlineDate.getTime() + timezoneOffsetMinutes * 60 * 1000);

  const nowString = userNow.toISOString().split("T")[0];
  const deadlineString = userDeadline.toISOString().split("T")[0];

  const nowDateOnly = new Date(nowString + "T00:00:00Z");
  const deadlineDateOnly = new Date(deadlineString + "T00:00:00Z");

  const diffTime = deadlineDateOnly.getTime() - nowDateOnly.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export async function runDeadlineChecks(db: any): Promise<void> {
  if (!db) {
    console.error("[DeadlineScheduler] Database connection not available.");
    return;
  }

  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Check double execution in Database to prevent duplicate runs on restarts
  try {
    const existingRun = await db.collection("scheduler_runs").findOne({ run_type: "daily_deadline", date: todayStr });
    if (existingRun) {
      console.log(`[DeadlineScheduler] Daily deadline checks already executed today (${todayStr}). Skipping.`);
      return;
    }
  } catch (err: any) {
    console.error("[DeadlineScheduler] Failed to verify daily scheduler runs history:", err.message);
  }

  // 2. Acquire Distributed Lock for multi-instance deployments
  const lockKey = "lock:daily_deadline";
  const lockAcquired = await acquireLock(lockKey, 1800000); // 30 mins lock
  if (!lockAcquired) {
    console.log("[DeadlineScheduler] Daily deadline checks execution locked by another instance. Skipping.");
    return;
  }

  console.log("[DeadlineScheduler] Starting daily deadline scan...");

  try {
    const usersCollection = db.collection("users");
    const oppsCollection = db.collection("opportunities");
    const notifCollection = db.collection("notifications");

    // Fetch all users who have bookmarks
    const users = await usersCollection.find({
      bookmarks: { $exists: true, $not: { $size: 0 } }
    }).toArray();

    // Filter users who have deadline reminders enabled
    const activeUsers = users.filter(user => {
      const prefs = user.notificationPreferences || { deadlineRemindersEnabled: true };
      return prefs.deadlineRemindersEnabled !== false;
    });

    if (activeUsers.length === 0) {
      return;
    }

    // Batch step 1: Collect unique opportunity IDs and active user UIDs
    const uniqueOppIds = new Set<string>();
    const activeUserUids: string[] = [];

    for (const user of activeUsers) {
      if (user.uid) activeUserUids.push(user.uid);
      const bookmarks = user.bookmarks || [];
      for (const oppId of bookmarks) {
        if (oppId) uniqueOppIds.add(String(oppId));
      }
    }

    // Batch step 2: Bulk fetch all required opportunities in 1 MongoDB query
    const oppMap = new Map<string, any>();
    if (uniqueOppIds.size > 0) {
      const stringIds: string[] = [];
      const objectIds: ObjectId[] = [];

      for (const idStr of uniqueOppIds) {
        stringIds.push(idStr);
        if (ObjectId.isValid(idStr)) {
          try {
            objectIds.push(new ObjectId(idStr));
          } catch {
            // fallback if ObjectId instantiation fails
          }
        }
      }

      const queryConditions: any[] = [{ id: { $in: stringIds } }];
      if (objectIds.length > 0) {
        queryConditions.push({ _id: { $in: objectIds } });
      }

      const opportunities = await oppsCollection.find({
        $or: queryConditions
      }).toArray();

      for (const opp of opportunities) {
        if (opp._id) {
          oppMap.set(opp._id.toString(), opp);
        }
        if (opp.id) {
          oppMap.set(String(opp.id), opp);
        }
      }
    }

    // Batch step 3: Bulk fetch existing deadline_reminder notifications for active users in 1 MongoDB query
    const notifiedSet = new Set<string>();
    if (activeUserUids.length > 0) {
      const existingNotifs = await notifCollection.find({
        userId: { $in: activeUserUids },
        type: "deadline_reminder"
      }).toArray();

      for (const notif of existingNotifs) {
        const key = `${notif.userId}:${notif.targetId}:${notif.title}`;
        notifiedSet.add(key);
      }
    }

    // Process each user and bookmark using O(1) in-memory Map & Set lookups
    for (const user of activeUsers) {
      const prefs = user.notificationPreferences || {
        emailEnabled: true,
        pushEnabled: true,
        deadlineRemindersEnabled: true,
        skillAlertsEnabled: true,
        scholarshipAlertsEnabled: true,
        hackathonAlertsEnabled: true,
        opportunityAlertsEnabled: true
      };

      const bookmarks = user.bookmarks || [];

      for (const oppId of bookmarks) {
        const oppIdStr = String(oppId);
        const opportunity = oppMap.get(oppIdStr);

        if (!opportunity) {
          continue;
        }

        const deadlineStr = opportunity.deadline;
        if (!deadlineStr || deadlineStr.toLowerCase() === "tbd" || deadlineStr.toLowerCase() === "rolling") {
          continue;
        }

        const timezoneOffset = user.timezoneOffset ?? 0;
        const diffDays = getDaysDifference(deadlineStr, timezoneOffset);

        // Trigger alerts on 7, 3, 2 (~48 hours), 1, or 0 days remaining
        if (![7, 3, 2, 1, 0].includes(diffDays)) {
          continue;
        }

        let title = `Deadline approaching in ${diffDays} days!`;
        let message = `Reminder: The deadline for bookmarked opportunity "${opportunity.title}" is in ${diffDays} days (${new Date(deadlineStr).toLocaleDateString()}).`;

        if (diffDays === 2) {
          title = `Deadline in 48 Hours (~2 Days)!`;
          message = `48-Hour Reminder: The deadline for bookmarked opportunity "${opportunity.title}" is in 2 days (${new Date(deadlineStr).toLocaleDateString()}).`;
        } else if (diffDays === 1) {
          title = `Deadline Tomorrow!`;
          message = `Urgent Reminder: The deadline for bookmarked opportunity "${opportunity.title}" is tomorrow (${new Date(deadlineStr).toLocaleDateString()}).`;
        } else if (diffDays === 0) {
          title = `Deadline is TODAY!`;
          message = `Urgent Reminder: Today is the last day to apply for bookmarked opportunity "${opportunity.title}".`;
        }

        // Check if user was already notified for this exact deadline condition
        const notifKey = `${user.uid}:${oppId}:${title}`;
        if (notifiedSet.has(notifKey)) {
          continue;
        }

        // Create the notification document
        const notificationDoc: Notification = {
          userId: user.uid,
          type: "deadline_reminder",
          title,
          message,
          targetId: oppId,
          read: false,
          createdAt: new Date()
        };

        await notifCollection.insertOne(notificationDoc);
        notifiedSet.add(notifKey);
        console.log(`[DeadlineScheduler] Reminded user ${user.uid} of deadline for opportunity ${oppId} (${diffDays} days left)`);

        // Real-Time Socket.io push (foreground handling)
        const io = getSocketIO();
        if (io) {
          io.emit(`NOTIFICATION_RECEIVED_${user.uid}`, {
            id: oppId + "_" + diffDays,
            ...notificationDoc,
            time: "Just now"
          });
        }

        // Enqueue background email job with mobile-responsive HTML template
        if (prefs.emailEnabled && user.email) {
          const html = generateDeadlineReminderHtml(
            opportunity.title,
            opportunity.company || opportunity.organization || 'YuvaHub Partner',
            new Date(deadlineStr).toLocaleDateString(),
            diffDays
          );

          await enqueueEmail({
            to: user.email,
            subject: `[YuvaHub] ${title}: ${opportunity.title}`,
            body: message,
            html
          });
        }

        // Enqueue background push job
        if (prefs.pushEnabled && user.fcmToken) {
          await enqueuePushNotification({
            userId: user.uid,
            message: `[YuvaHub] ${title}: ${opportunity.title}`
          });
        }
      }
    }

    // Record run history in Database to prevent duplicate runs on restarts
    await db.collection("scheduler_runs").updateOne(
      { run_type: "daily_deadline", date: todayStr },
      { $set: { run_type: "daily_deadline", date: todayStr, executed_at: new Date() } },
      { upsert: true }
    );
  } catch (err) {
    console.error("[DeadlineScheduler] Error running deadline reminders check:", err);
  } finally {
    await releaseLock(lockKey);
  }
}

/**
 * Weekly Summary Digest
 * Sends a weekly digest email to users summarizing all active bookmarks expiring in the next 7 days.
 */
export async function runWeeklyDigest(db: any): Promise<void> {
  if (!db) return;

  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Check double execution in Database to prevent duplicate runs on restarts
  try {
    const existingRun = await db.collection("scheduler_runs").findOne({ run_type: "weekly_digest", date: todayStr });
    if (existingRun) {
      console.log(`[DeadlineScheduler] Weekly digest already executed today (${todayStr}). Skipping.`);
      return;
    }
  } catch (err: any) {
    console.error("[DeadlineScheduler] Failed to verify weekly scheduler runs history:", err.message);
  }

  // 2. Acquire Distributed Lock for multi-instance deployments
  const lockKey = "lock:weekly_digest";
  const lockAcquired = await acquireLock(lockKey, 1800000); // 30 mins lock
  if (!lockAcquired) {
    console.log("[DeadlineScheduler] Weekly digest execution locked by another instance. Skipping.");
    return;
  }

  console.log("[DeadlineScheduler] Running weekly summary digest scan...");

  try {
    const usersCollection = db.collection("users");
    const oppsCollection = db.collection("opportunities");

    const users = await usersCollection.find({
      bookmarks: { $exists: true, $not: { $size: 0 } }
    }).toArray();

    const activeUsers = users.filter(user => {
      if (!user.email) return false;
      const prefs = user.notificationPreferences || { emailEnabled: true };
      return prefs.emailEnabled !== false;
    });

    if (activeUsers.length === 0) return;

    // Collect all unique oppIds
    const uniqueOppIds = new Set<string>();
    for (const user of activeUsers) {
      const bookmarks = user.bookmarks || [];
      for (const oppId of bookmarks) {
        if (oppId) uniqueOppIds.add(String(oppId));
      }
    }

    // Batch fetch opportunities
    const oppMap = new Map<string, any>();
    if (uniqueOppIds.size > 0) {
      const stringIds: string[] = [];
      const objectIds: ObjectId[] = [];

      for (const idStr of uniqueOppIds) {
        stringIds.push(idStr);
        if (ObjectId.isValid(idStr)) {
          try {
            objectIds.push(new ObjectId(idStr));
          } catch {
            // fallback
          }
        }
      }

      const queryConditions: any[] = [{ id: { $in: stringIds } }];
      if (objectIds.length > 0) {
        queryConditions.push({ _id: { $in: objectIds } });
      }

      const opportunities = await oppsCollection.find({
        $or: queryConditions
      }).toArray();

      for (const opp of opportunities) {
        if (opp._id) {
          oppMap.set(opp._id.toString(), opp);
        }
        if (opp.id) {
          oppMap.set(String(opp.id), opp);
        }
      }
    }

    for (const user of activeUsers) {
      const bookmarks = user.bookmarks || [];
      const expiringOpps: Array<{ title: string; org: string; deadline: string }> = [];
      const timezoneOffset = user.timezoneOffset ?? 0;

      for (const oppId of bookmarks) {
        const opp = oppMap.get(String(oppId));

        if (!opp || !opp.deadline) continue;
        
        const diffDays = getDaysDifference(opp.deadline, timezoneOffset);

        if (diffDays >= 0 && diffDays <= 7) {
          expiringOpps.push({
            title: opp.title,
            org: opp.company || opp.organization || '',
            deadline: new Date(opp.deadline).toLocaleDateString()
          });
        }
      }

      if (expiringOpps.length > 0) {
        const html = generateWeeklyDigestHtml(user.name || 'Student', expiringOpps);
        await enqueueEmail({
          to: user.email,
          subject: `[YuvaHub] Your Weekly Bookmarks Summary Digest (${expiringOpps.length} Deadlines Closing Soon)`,
          body: `Hello ${user.name || 'Student'}, you have ${expiringOpps.length} bookmarked opportunities with deadlines this week.`,
          html
        });
        console.log(`[DeadlineScheduler] Sent weekly digest to ${user.email} with ${expiringOpps.length} opportunities.`);
      }
    }

    // Record run history in Database to prevent duplicate runs on restarts
    await db.collection("scheduler_runs").updateOne(
      { run_type: "weekly_digest", date: todayStr },
      { $set: { run_type: "weekly_digest", date: todayStr, executed_at: new Date() } },
      { upsert: true }
    );
  } catch (err) {
    console.error("[DeadlineScheduler] Error running weekly digest:", err);
  } finally {
    await releaseLock(lockKey);
  }
}

