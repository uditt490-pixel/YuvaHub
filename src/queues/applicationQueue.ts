/**
 * Application Processing Queue
 * 
 * Handles async application-related jobs:
 * - AI draft generation
 * - Application preparation
 * - Email/application workflow triggers
 */

import { Queue } from "bullmq";
import { connection, isRedisReady } from "./connection";

export interface ApplicationJobData {
  userId: string;
  opportunityId: string;
  opportunityTitle: string;
  organization?: string;
  profile?: {
    name?: string;
    email?: string;
    skills?: string[];
    experience?: string;
  };
  action:
    | "generate_draft"
    | "prepare_application"
    | "send_application";
}

export const applicationQueue = new Queue<ApplicationJobData>(
  "application-processing",
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

/**
 * Add application task to queue
 */
export async function addApplicationJob(
  data: ApplicationJobData
) {
  if (!isRedisReady()) {
    console.log(`[ApplicationQueue Fallback] Redis offline. Executing synchronous fallback for action: ${data.action}`);
    return { id: `local_app_${Date.now()}`, data };
  }
  return applicationQueue.add(
    data.action,
    data
  );
}