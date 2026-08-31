import { Queue } from "bullmq";
import { connection } from "./connection.js";

export const newsletterQueue = new Queue("newsletterQueue", {
  connection: connection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});

/**
 * Schedule weekly newsletter recurring cron (every Monday at 9:00 AM)
 */
export async function scheduleWeeklyNewsletterJob() {
  try {
    await newsletterQueue.add(
      "dispatchWeeklyNewsletter",
      { scheduledAt: new Date().toISOString() },
      {
        repeat: {
          pattern: "0 9 * * 1", // Every Monday at 9 AM
        },
        jobId: "weekly_newsletter_cron",
      }
    );
  } catch (err) {
    console.warn("[NewsletterQueue] Could not schedule recurring cron job:", err);
  }
}
