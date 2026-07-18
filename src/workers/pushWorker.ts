import { Worker, Job } from "bullmq";
import { connection } from "../queues/connection";
import { PushJobData } from "../queues/pushQueue";

export const pushWorker = new Worker<PushJobData>(
  "pushQueue",
  async (job: Job<PushJobData>) => {
    console.log(`[PushWorker] Processing job ${job.id} for userId ${job.data.userId}`);
    // Simulate push notification delay
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    if (Math.random() < 0.05) {
      throw new Error(`Simulated push failure for job ${job.id}`);
    }
    
    console.log(`[PushWorker] Successfully sent push to ${job.data.userId}`);
  },
  { connection: connection as any }
);

pushWorker.on("completed", (job) => {
  console.log(`[PushWorker] Job ${job.id} completed successfully`);
});

pushWorker.on("failed", (job, err) => {
  console.error(`[PushWorker] Job ${job?.id} failed with error: ${err.message}`);
  
  if (job && job.attemptsMade >= (job.opts.attempts || 1)) {
    console.error(`[PushWorker] Job ${job.id} has exhausted all retries. Moving to DLQ (Logged).`);
  }
});
