import { Queue } from "bullmq";
import { connection } from "./connection";
import { QueueName } from "./queueNames.js";

export const scraperQueue = new Queue(QueueName.SCRAPER, {
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
