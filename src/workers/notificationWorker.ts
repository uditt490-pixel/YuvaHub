import { Worker, Job } from "bullmq";
import { connection } from "../queues/connection";
import { NotificationDispatchJobData } from "../queues/notificationQueue";
import { emailQueue } from "../queues/emailQueue";
import { generateSavedSearchDigestHtml } from "./emailTemplates";
import { dbCommand, dbQuery } from "../api/db";
import { logger } from "../utils/logger";
import { runSavedSearchMatcher } from "../services/savedSearchMatcherService";

export const notificationWorker = new Worker<any>(
  "notificationQueue",
  async (job: Job) => {
    if (job.name === "daily-matcher") {
      logger.info("[NotificationWorker] Running daily-matcher job");
      await runSavedSearchMatcher();
      return;
    }

    if (job.name === "dispatch-digest") {
      const { userId, preferences, matches } = job.data as NotificationDispatchJobData;
      logger.info(`[NotificationWorker] Processing dispatch-digest for user ${userId} with ${matches.length} matches`);

      if (!matches || matches.length === 0) return;

      const user = await dbQuery?.collection("users").findOne({ $or: [{ uid: userId }, { firebaseUid: userId }, { _id: userId }] });

      if (preferences === "in_app" || preferences === "both") {
        await dbCommand?.collection("notifications").insertOne({
          userId,
          type: "new_opportunity",
          title: `Daily Match Digest`,
          message: `Found ${matches.length} new opportunit${matches.length > 1 ? 'ies' : 'y'} matching your saved searches.`,
          link: `/opportunities`,
          read: false,
          createdAt: new Date(),
        });
        logger.info(`[NotificationWorker] In-app notification sent for ${userId}`);
      }

      if ((preferences === "email" || preferences === "both") && user && user.email) {
        const emailHtml = generateSavedSearchDigestHtml(user.name || "User", matches);
        
        await emailQueue.add("sendEmail", {
          to: user.email,
          subject: `Your Daily Opportunity Matches - YuvaHub`,
          body: `You have ${matches.length} new opportunities waiting for you.`,
          html: emailHtml,
        }, {
          attempts: 3,
          backoff: { type: "exponential", delay: 1000 },
        });
        logger.info(`[NotificationWorker] Email digest queued for ${userId}`);
      }
    }
  },
  { connection: connection as any }
);

notificationWorker.on("completed", (job) => {
  logger.info(`[NotificationWorker] Job ${job.name} (${job.id}) completed successfully`);
});

notificationWorker.on("failed", (job, err) => {
  logger.error({ err, jobId: job?.id }, `[NotificationWorker] Job ${job?.name} failed`);
});

let notificationWorkerErrorLogged = false;
notificationWorker.on("error", (err) => {
  if (!notificationWorkerErrorLogged) {
    logger.warn('[NotificationWorker] Redis connection offline. Worker listening paused.');
    notificationWorkerErrorLogged = true;
  }
});
