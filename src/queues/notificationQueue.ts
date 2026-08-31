import { Queue, QueueOptions } from 'bullmq';
import { redisClient } from '../config/redis';

/**
 * Queue options for the notification pipeline, including rate limiting and retries.
 */
const queueOptions: QueueOptions = {
    connection: redisClient,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        rateLimiter: {
            max: 10, // Max 10 notifications per user per minute
            duration: 60000,
        },
        removeOnComplete: {
            age: 86400,
            count: 5000,
        },
    },
};

/**
 * BullMQ Queue instance for handling multi-channel notification dispatch.
 */
export const notificationQueue = new Queue(
    'multi_channel_notifications',
    queueOptions
);

/**
 * Helper function to add a notification job to the queue.
 */
export const queueNotification = async (
    userId: string,
    eventType: string,
    payload: any,
    isCritical: boolean = false
) => {
    return await notificationQueue.add(
        'dispatch-notification',
        { userId, eventType, payload, isCritical },
        {
            jobId: `notif-${userId}-${eventType}-${Date.now()}`,
        }
    );
import { Queue } from "bullmq";
import { connection, isRedisReady } from "./connection";

export const notificationQueue = new Queue("notificationQueue", { connection: connection as any });

export interface NotificationDispatchJobData {
  userId: string;
  preferences: 'in_app' | 'email' | 'both' | 'none';
  matches: any[];
}

export const enqueueNotificationDispatch = async (data: NotificationDispatchJobData) => {
  if (!isRedisReady()) {
    console.warn(`[NotificationQueue] Redis offline. Cannot enqueue notification dispatch for ${data.userId}`);
    return null;
  }
  return await notificationQueue.add("dispatch-digest", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  });
};

export const scheduleDailyMatcher = async () => {
  if (!isRedisReady()) {
    console.warn(`[NotificationQueue] Redis offline. Cannot schedule daily matcher.`);
    return null;
  }
  // Schedule a repeatable job for daily matching
  return await notificationQueue.add(
    "daily-matcher",
    {},
    {
      repeat: {
        pattern: "0 0 * * *", // Daily at midnight
      },
    }
  );
};
