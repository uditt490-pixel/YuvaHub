import { Queue } from "bullmq";
import { connection } from "./connection";

export const pushQueue = new Queue("pushQueue", { connection: connection as any });

export interface PushJobData {
  userId: string;
  message: string;
}

export const enqueuePushNotification = async (data: PushJobData) => {
  return await pushQueue.add("sendPush", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  });
};
