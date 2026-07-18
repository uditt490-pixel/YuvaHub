import { emailWorker } from "./workers/emailWorker";
import { pushWorker } from "./workers/pushWorker";
import { scraperWorker } from "./workers/scraperWorker";


console.log("[Worker] Starting background workers...");

const shutdown = async () => {
  console.log("[Worker] Shutting down workers gracefully...");
  await Promise.all([
    emailWorker.close(),
    pushWorker.close(),
    scraperWorker.close()
  ]);
  console.log("[Worker] Shutdown complete.");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("[Worker] Workers started and listening for jobs.");
