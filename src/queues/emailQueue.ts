import { Queue } from "bullmq";
import { connection, isRedisReady } from "./connection";

export const emailQueue = new Queue("emailQueue", { connection: connection as any });

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export const enqueueEmail = async (data: EmailJobData) => {
  if (!isRedisReady()) {
    console.log(`[EmailQueue Fallback] Redis offline. Simulating direct email processing for: ${data.to}`);
    return { id: `local_${Date.now()}`, data };
  }
  return await emailQueue.add("sendEmail", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  });
};
