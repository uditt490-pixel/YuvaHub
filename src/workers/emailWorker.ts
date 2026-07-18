import { Worker, Job } from "bullmq";
import { connection } from "../queues/connection";
import { EmailJobData } from "../queues/emailQueue";

export const emailWorker = new Worker<EmailJobData>(
  "emailQueue",
  async (job: Job<EmailJobData>) => {
    console.log(`[EmailWorker] Processing job ${job.id} for ${job.data.to}`);
    // Simulate email sending delay (e.g., 500ms)
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Simulate random failure for resiliency testing (10% chance)
    if (Math.random() < 0.1) {
      throw new Error(`Simulated email failure for job ${job.id}`);
    }
    
    console.log(`[EmailWorker] Successfully sent email to ${job.data.to}`);
  },
  { connection: connection as any }
);

emailWorker.on("completed", (job) => {
  console.log(`[EmailWorker] Job ${job.id} completed successfully`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`[EmailWorker] Job ${job?.id} failed with error: ${err.message}`);
  
  if (job && job.attemptsMade >= (job.opts.attempts || 1)) {
    console.error(`[EmailWorker] Job ${job.id} has exhausted all retries. Moving to DLQ (Logged).`);
    // Here we could explicitly move data to a MongoDB DLQ collection if needed.
  }
});
