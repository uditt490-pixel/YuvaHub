import { Worker, Job } from "bullmq";
import { connection } from "../queues/connection";
import { MockInterviewJobData } from "../queues/mockInterviewQueue";

async function processMockInterviewJob(
  job: Job<MockInterviewJobData>
) {
  const data = job.data;
  console.log(
    `[MockInterviewWorker] Processing ${data.action} for user ${data.userId}`
  );

  switch (data.action) {
    case "join_queue": {
      console.log(`User ${data.userId} joined queue for role ${data.targetRole}`);
      // In a real implementation, add user to Firestore matchmaking queue collection here.
      // Then optionally trigger a 'match_make' job.
      return {
        success: true,
        type: "joined",
      };
    }

    case "leave_queue": {
      console.log(`User ${data.userId} left queue`);
      return {
        success: true,
        type: "left",
      };
    }

    case "match_make": {
      console.log(`Attempting match for role ${data.targetRole}`);
      // Query Firestore for two users in 'waiting' status with the same targetRole.
      // If found, update their status to 'matched' and create a mockInterviewSessionSchema doc.
      // Then notify both via Socket.io/Push.
      return {
        success: true,
        type: "match_attempted",
      };
    }

    default:
      throw new Error(`Unknown mock interview action: ${data.action}`);
  }
}

export const mockInterviewWorker = new Worker<MockInterviewJobData>(
  "mock-interview-matchmaking",
  processMockInterviewJob,
  {
    connection: connection as any,
    concurrency: 5,
  }
);

mockInterviewWorker.on("completed", (job) => {
  console.log(`[MockInterviewWorker] Job ${job.id} completed`);
});

mockInterviewWorker.on("failed", (job, error) => {
  console.error(`[MockInterviewWorker] Job ${job?.id} failed`, error);
});

let mockInterviewWorkerErrorLogged = false;
mockInterviewWorker.on("error", (err) => {
  if (!mockInterviewWorkerErrorLogged) {
    console.warn('[MockInterviewWorker] Redis connection offline. Worker listening paused.');
    mockInterviewWorkerErrorLogged = true;
  }
});
