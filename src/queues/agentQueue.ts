/**
 * Application Agent Processing Queue
 * 
 * Handles async agent jobs:
 * - Filling out external forms via Playwright
 */

import { Queue } from "bullmq";
import { connection, isRedisReady } from "./connection";

export interface AgentJobData {
  userId: string;
  jobUrl: string;
  action: "fill_application";
}

export const agentQueue = new Queue<AgentJobData>(
  "agent-processing",
  {
    connection: connection as any,
    defaultJobOptions: {
      attempts: 1, // Only 1 attempt because Playwright state is complex and we'll pause on failure
      removeOnComplete: {
        count: 100,
      },
      removeOnFail: {
        count: 50,
      },
    },
  }
);

/**
 * Add agent task to queue
 */
export async function addAgentJob(
  data: AgentJobData
) {
  if (!isRedisReady()) {
    console.log(`[AgentQueue Fallback] Redis offline. Cannot process headless browser without queue currently.`);
    return { id: `local_agent_${Date.now()}`, data };
  }
  return agentQueue.add(
    data.action,
    data
  );
}
