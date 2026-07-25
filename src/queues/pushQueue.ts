import { Queue } from "bullmq";
import { connection, isRedisReady } from "./connection";

export const pushQueue = new Queue("pushQueue", { connection: connection as any });

export interface PushJobData {
  userId: string;
  message: string;
}

export const enqueuePushNotification = async (data: PushJobData) => {
  if (!isRedisReady()) {
    console.log(`[PushQueue Fallback] Redis offline. Simulating in-memory push notification for user: ${data.userId}`);
    return { id: `local_push_${Date.now()}`, data };
  }
  return await pushQueue.add("sendPush", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  });
};
