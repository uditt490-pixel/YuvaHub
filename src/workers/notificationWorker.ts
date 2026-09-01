import { Worker, Job } from "bullmq";
import { connection } from "../queues/connection";
import { NotificationDispatchJobData } from "../queues/notificationQueue";
import { emailQueue } from "../queues/emailQueue";
import { generateSavedSearchDigestHtml } from "./emailTemplates";
import { dbCommand, dbQuery } from "../api/db";
import { logger } from "../utils/logger";
import { runSavedSearchMatcher } from "../services/savedSearchMatcherService";
import { getApprovedChannels, dispatchEmail, dispatchPush } from '../services/multiChannelDeliveryService';
import { User } from '../models/User';

// 1. Worker for dispatch-digest and daily-matcher
export const notificationDigestWorker = new Worker<any>(
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

notificationDigestWorker.on("completed", (job) => {
  logger.info(`[NotificationWorker] Job ${job.name} (${job.id}) completed successfully`);
});

notificationDigestWorker.on("failed", (job, err) => {
  logger.error({ err, jobId: job?.id }, `[NotificationWorker] Job ${job?.name} failed`);
});

let notificationDigestWorkerErrorLogged = false;
notificationDigestWorker.on("error", (err) => {
  if (!notificationDigestWorkerErrorLogged) {
    logger.warn('[NotificationWorker] Redis connection offline. Worker listening paused.');
    notificationDigestWorkerErrorLogged = true;
  }
});


// 2. Worker for multi-channel notifications
export const notificationWorker = new Worker(
    'multi_channel_notifications',
    async (job: Job) => {
        const { userId, eventType, payload, isCritical } = job.data;
        logger.info(`Processing notification for user ${userId}, type: ${eventType}`);

        try {
            // 1. Determine approved channels based on user preferences
            const approvedChannels = await getApprovedChannels(userId, eventType, isCritical);

            if (approvedChannels.length === 0) {
                logger.info(`No approved channels for user ${userId}, type ${eventType}. Skipping.`);
                return { status: 'skipped', reason: 'no_approved_channels' };
            }

            // 2. Fetch user details for delivery
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // 3. Dispatch to approved channels
            const results = [];

            if (approvedChannels.includes('inApp')) {
                // Mock in-app notification save
                // await InAppNotification.create({ userId, ...payload });
                results.push('inApp: queued');
            }

            if (approvedChannels.includes('email') && user.email) {
                await dispatchEmail(user.email, payload.subject || 'New Notification', payload.html || 'You have a new update.');
                results.push('email: sent');
            }

            if (approvedChannels.includes('push')) {
                await dispatchPush(userId, payload.title || 'Update', payload.body || 'Check the app for details.');
                results.push('push: sent');
            }

            logger.info(`Successfully dispatched notification to channels: ${results.join(', ')}`);
            return { status: 'success', channels: results };
        } catch (error) {
            logger.error({ err: error }, `Notification dispatch failed for user ${userId}`);
            throw error;
        }
    },
    { connection: connection as any }
);
