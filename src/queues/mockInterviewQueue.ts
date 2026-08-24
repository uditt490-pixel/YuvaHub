import { Queue } from "bullmq";
import { connection, isRedisReady } from "./connection";

export interface MockInterviewJobData {
  userId: string;
  targetRole: string;
  experienceLevel?: string;
  action: "join_queue" | "leave_queue" | "match_make";
}

export const mockInterviewQueue = new Queue<MockInterviewJobData>(
  "mock-interview-matchmaking",
  {
    connection: connection as any,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: {
        count: 100,
      },
      removeOnFail: {
        count: 50,
      },
    },
  }
);

export async function addMockInterviewJob(
  data: MockInterviewJobData
) {
  if (!isRedisReady()) {
    console.log(`[MockInterviewQueue Fallback] Redis offline. Executing synchronous fallback for action: ${data.action}`);
    return { id: `local_mi_${Date.now()}`, data };
  }
  return mockInterviewQueue.add(
    data.action,
    data
  );
}
