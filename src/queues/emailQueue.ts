import { Queue } from "bullmq";
import { connection } from "./connection";

export const emailQueue = new Queue("emailQueue", { connection: connection as any });

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
}

export const enqueueEmail = async (data: EmailJobData) => {
  return await emailQueue.add("sendEmail", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  });
};
