import { logger } from "./utils/logger";
import { emailWorker } from "./workers/emailWorker";
import { pushWorker } from "./workers/pushWorker";
import { scraperWorker } from "./workers/scraperWorker";
import { initAgentWorker, stopAgentWorker } from "./workers/applicationAgentWorker";
import { mentorshipWorker } from "./workers/mentorshipWorker";
import { mockInterviewWorker } from "./workers/mockInterviewWorker";

const workerId = crypto.randomUUID();

logger.info({ workerId }, "Starting background workers...");
const agentWorker = initAgentWorker();

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

  logger.info({ workerId }, "Shutdown complete.");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

logger.info({ workerId }, "Workers started and listening for jobs.");
