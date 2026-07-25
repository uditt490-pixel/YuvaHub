import { Queue } from "bullmq";
import { connection } from "./connection";

export const scraperQueue = new Queue("scraper-jobs", {
  connection: connection as any,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 60000,
    },
    removeOnComplete: 100,
    removeOnFail: 1000,
  },
});
