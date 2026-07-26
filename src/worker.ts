import { emailWorker } from "./workers/emailWorker";
import { pushWorker } from "./workers/pushWorker";
import { scraperWorker } from "./workers/scraperWorker";
import { applicationWorker } from "./workers/applicationWorker";
import { resumeWorker } from "./workers/resumeWorker";
import { initAgentWorker, stopAgentWorker } from "./workers/applicationAgentWorker";
import { deadlineWorker } from "./workers/deadlineWorker.js";

console.log("[Worker] Starting background workers...");

const agentWorker = initAgentWorker();

const shutdown = async () => {
  console.log("[Worker] Shutting down workers gracefully...");
  
  // Disable new job fetching and close workers
  await Promise.all([
    emailWorker.close(),
    pushWorker.close(),
    scraperWorker.close(),
    applicationWorker.close(),
    resumeWorker.close(),
    deadlineWorker.close(),
    stopAgentWorker()
  ]);
  
  console.log("[Worker] Shutdown complete.");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("[Worker] All background workers started and listening for jobs.");
