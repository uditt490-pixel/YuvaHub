import { logger } from "./utils/logger";
import { emailWorker } from "./workers/emailWorker";
import { pushWorker } from "./workers/pushWorker";
import { scraperWorker } from "./workers/scraperWorker";
import { initAgentWorker, stopAgentWorker } from "./workers/applicationAgentWorker";
import { mentorshipWorker } from "./workers/mentorshipWorker";
import { mockInterviewWorker } from "./workers/mockInterviewWorker";
import { exportWorker, closeExportWorker } from "./workers/exportWorker";
import { notificationWorker } from "./workers/notificationWorker";
import { scheduleDailyMatcher } from "./queues/notificationQueue";
import { opportunityExpiryWorker } from "./workers/opportunityExpiryWorker";
import { opportunityExpiryQueue } from "./queues/opportunityExpiryQueue";
import { initOpportunityExpiredConsumer } from "./consumers/opportunityExpiredConsumer";

const workerId = crypto.randomUUID();

logger.info({ workerId }, "Starting background workers...");
const agentWorker = initAgentWorker();

initOpportunityExpiredConsumer().catch(err => {
  logger.error({ err }, "Failed to initialize opportunity expired consumer");
});

// Schedule the daily saved search matcher job via BullMQ
scheduleDailyMatcher().catch(err => {
  logger.error({ err }, "Failed to schedule daily saved search matcher job");
});

// Schedule opportunity expiry check every 12 hours
opportunityExpiryQueue.add(
  "check-expirations",
  {},
  {
    repeat: {
      pattern: "0 */12 * * *", // every 12 hours
    },
  }
).catch(err => {
  logger.error({ err }, "Failed to schedule opportunity expiry job");
});

const shutdown = async () => {
  logger.info({ workerId }, "Shutting down workers gracefully...");

  await Promise.all([
    emailWorker.close(),
    pushWorker.close(),
    scraperWorker.close(),
    mentorshipWorker.close(),
    mockInterviewWorker.close(),
    opportunityExpiryWorker.close(),
    notificationWorker.close(),
    closeExportWorker(),
    stopAgentWorker()
  ]);

  logger.info({ workerId }, "Shutdown complete.");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

logger.info({ workerId }, "Workers started and listening for jobs.");
