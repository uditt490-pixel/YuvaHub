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
