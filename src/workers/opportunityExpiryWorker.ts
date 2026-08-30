import { Worker } from "bullmq";
import { connection } from "../queues/connection";
import { logger } from "../utils/logger";
import { processExpiredOpportunities } from "../services/opportunityExpiryService";

export const opportunityExpiryWorker = new Worker(
  "opportunity-expiry",
  async (job) => {
    logger.info({ jobId: job.id }, "Starting opportunity expiry job...");
    try {
      await processExpiredOpportunities();
      logger.info({ jobId: job.id }, "Opportunity expiry job completed.");
    } catch (error) {
      logger.error({ jobId: job.id, error }, "Opportunity expiry job failed.");
      throw error;
    }
  },
  {
    connection,
    concurrency: 1, // Run one expiry scan at a time to avoid DB conflicts
  }
);

opportunityExpiryWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err }, "Opportunity expiry worker failed to process job");
});

opportunityExpiryWorker.on("error", (err) => {
  logger.error({ err }, "Opportunity expiry worker encountered an error");
});
