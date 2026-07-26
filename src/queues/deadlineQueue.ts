import { Queue } from "bullmq";
import { connection } from "./connection.js";
import { QueueName } from "./queueNames.js";

export const deadlineQueue = new Queue(QueueName.NOTIFICATION, {
  connection: connection as any,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 500,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});

export async function scheduleDeadlineNotification(opportunityId: string, deadline: Date) {
  const notifyAt = deadline.getTime() - 24 * 60 * 60 * 1000; // 1 day before
  const delay = Math.max(0, notifyAt - Date.now());

  await deadlineQueue.add(
    "deadline-alert",
    { opportunityId, deadline: deadline.toISOString() },
    {
      delay,
      jobId: `deadline-${opportunityId}`, // Idempotent — updating replaces existing
    }
  );
  console.log(`[DeadlineQueue] Scheduled alert for opportunity ${opportunityId} with delay ${delay}ms`);
}

export async function registerRepeatableDeadlineJobs() {
  try {
    // Run daily at midnight
    await deadlineQueue.add(
      "daily-deadline-checks",
      {},
      {
        repeat: { pattern: "0 0 * * *" },
        jobId: "repeat-daily-deadline",
      }
    );
    // Run weekly at Sunday midnight
    await deadlineQueue.add(
      "weekly-digest-checks",
      {},
      {
        repeat: { pattern: "0 0 * * 0" },
        jobId: "repeat-weekly-digest",
      }
    );
    console.log("[DeadlineQueue] Repeatable checks successfully registered.");
  } catch (err: any) {
    console.error("[DeadlineQueue] Failed to register repeatable jobs:", err.message);
  }
}
