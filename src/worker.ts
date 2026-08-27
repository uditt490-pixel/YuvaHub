import { logger } from "./utils/logger";
import { emailWorker } from "./workers/emailWorker";
import { pushWorker } from "./workers/pushWorker";
import { scraperWorker } from "./workers/scraperWorker";
import { initAgentWorker, stopAgentWorker } from "./workers/applicationAgentWorker";
import { mentorshipWorker } from "./workers/mentorshipWorker";
import { mockInterviewWorker } from "./workers/mockInterviewWorker";
import { runSavedSearchMatcher } from "./services/savedSearchMatcherService";

const workerId = crypto.randomUUID();

logger.info({ workerId }, "Starting background workers...");
const agentWorker = initAgentWorker();

const savedSearchInterval = setInterval(() => {
  runSavedSearchMatcher().catch(err => {
    logger.error({ err }, "Error running saved search matcher");
  });
}, 60 * 60 * 1000); // Run every 1 hour

const shutdown = async () => {
  logger.info({ workerId }, "Shutting down workers gracefully...");

  await Promise.all([
    emailWorker.close(),
    pushWorker.close(),
    scraperWorker.close(),
    mentorshipWorker.close(),
    mockInterviewWorker.close(),
    stopAgentWorker()
  ]);

  clearInterval(savedSearchInterval);

  logger.info({ workerId }, "Shutdown complete.");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

logger.info({ workerId }, "Workers started and listening for jobs.");
