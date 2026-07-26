import { Worker } from "bullmq";
import { connection } from "../queues/connection.js";
import { QueueName } from "../queues/queueNames.js";
import { getCommandDB } from "../lib/mongodb.js";
import { ObjectId } from "mongodb";
import { runDeadlineChecks, runWeeklyDigest } from "../services/deadlineScheduler.js";
import { enqueueEmail } from "../queues/emailQueue.js";
import { enqueuePushNotification } from "../queues/pushQueue.js";
import { getSocketIO } from "../api/socketInstance.js";
import { generateDeadlineReminderHtml } from "./emailTemplates.js";

export const deadlineWorker = new Worker(
  QueueName.NOTIFICATION,
  async (job) => {
    console.log(`[DeadlineWorker] Processing job ${job.id} of name: ${job.name}`);
    
    if (job.name === "daily-deadline-checks") {
      const db = await getCommandDB();
      await runDeadlineChecks(db);
      return;
    }

    if (job.name === "weekly-digest-checks") {
      const db = await getCommandDB();
      await runWeeklyDigest(db);
      return;
    }

    if (job.name === "deadline-alert") {
      const { opportunityId } = job.data;
      const db = await getCommandDB();

      let query: any = { id: opportunityId };
      if (ObjectId.isValid(opportunityId)) {
        query = { $or: [{ id: opportunityId }, { _id: new ObjectId(opportunityId) }] };
      }
      const opportunity = await db.collection("opportunities").findOne(query);

      if (!opportunity || !opportunity.deadline) {
        console.warn(`[DeadlineWorker] Opportunity ${opportunityId} not found or has no deadline.`);
        return;
      }

      const deadlineDate = new Date(opportunity.deadline);
      if (isNaN(deadlineDate.getTime())) {
        console.warn(`[DeadlineWorker] Opportunity ${opportunityId} has an invalid deadline.`);
        return;
      }

      // Find all users who bookmarked this opportunity
      const users = await db.collection("users").find({
        bookmarks: { $in: [opportunityId, opportunity._id?.toString(), new ObjectId(opportunityId)] }
      }).toArray();

      for (const user of users) {
        const prefs = user.notificationPreferences || { deadlineRemindersEnabled: true };
        if (prefs.deadlineRemindersEnabled === false) continue;

        const title = `Deadline Tomorrow!`;
        const message = `Urgent Reminder: The deadline for bookmarked opportunity "${opportunity.title}" is tomorrow (${deadlineDate.toLocaleDateString()}).`;

        // Create the notification document
        const notificationDoc = {
          userId: user.uid,
          type: "deadline_reminder",
          title,
          message,
          targetId: opportunityId,
          read: false,
          createdAt: new Date()
        };

        await db.collection("notifications").insertOne(notificationDoc);

        // Real-Time Socket.io push
        const io = getSocketIO();
        if (io) {
          io.emit(`NOTIFICATION_RECEIVED_${user.uid}`, {
            id: opportunityId + "_1",
            ...notificationDoc,
            time: "Just now"
          });
        }

        // Enqueue background email job
        if (prefs.emailEnabled && user.email) {
          const html = generateDeadlineReminderHtml(
            opportunity.title,
            opportunity.company || opportunity.organization || 'YuvaHub Partner',
            deadlineDate.toLocaleDateString(),
            1
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
  },
  {
    connection: connection as any,
    concurrency: 5,
  }
);

deadlineWorker.on("completed", (job) => {
  console.log(`[DeadlineWorker] Job ${job.id} completed successfully`);
});

deadlineWorker.on("failed", async (job, err) => {
  console.error(`[DeadlineWorker] Job ${job?.id} failed with error: ${err.message}`);

  if (job && job.attemptsMade >= (job.opts.attempts || 3)) {
    console.error(`[DeadlineWorker] Job ${job.id} has exhausted all retries. Logging to dead_letter_jobs DB collection.`);
    try {
      const db = await getCommandDB();
      await db.collection("dead_letter_jobs").insertOne({
        queue: QueueName.NOTIFICATION,
        jobId: job.id,
        data: job.data,
        failedAt: new Date(),
        attemptsMade: job.attemptsMade,
        error: err.message,
        stack: err.stack
      });
    } catch (dbErr: any) {
      console.error("[DeadlineWorker] Failed to write to dead_letter_jobs collection:", dbErr.message);
    }
  }
});

let deadlineWorkerErrorLogged = false;
deadlineWorker.on("error", (err) => {
  if (!deadlineWorkerErrorLogged) {
    console.warn('[DeadlineWorker] Redis connection offline. Worker listening paused.');
    deadlineWorkerErrorLogged = true;
  }
});

connection.on("ready", () => {
  deadlineWorkerErrorLogged = false;
});
