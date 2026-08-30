import { Queue } from "bullmq";
import { connection } from "./connection";

export const opportunityExpiryQueue = new Queue("opportunity-expiry", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000 * 60, // 1 minute
    },
    removeOnComplete: true,
    removeOnFail: 100, // Keep last 100 failed jobs for inspection
  },
});
