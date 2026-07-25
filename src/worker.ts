import { emailWorker } from "./workers/emailWorker";
import { pushWorker } from "./workers/pushWorker";
import { scraperWorker } from "./workers/scraperWorker";
import { initAgentWorker, stopAgentWorker } from "./workers/applicationAgentWorker";

console.log("[Worker] Starting background workers...");

const agentWorker = initAgentWorker();

const shutdown = async () => {
  console.log("[Worker] Shutting down workers gracefully...");
  await Promise.all([
    emailWorker.close(),
    pushWorker.close(),
    scraperWorker.close(),
    stopAgentWorker()
  ]);
  console.log("[Worker] Shutdown complete.");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("[Worker] Workers started and listening for jobs.");
