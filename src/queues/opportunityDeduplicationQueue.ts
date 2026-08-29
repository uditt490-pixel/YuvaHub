import { Queue, QueueOptions } from 'bullmq';
import { redisClient } from '../config/redis.js';

/**
 * Queue options for the opportunity deduplication pipeline.
 * Configured for reliability and graceful shutdowns.
 */
const queueOptions: QueueOptions = {
    connection: redisClient as any,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: {
            age: 3600, // Keep successful jobs for 1 hour
            count: 1000,
        },
        removeOnFail: {
            age: 24 * 3600, // Keep failed jobs for 24 hours for debugging
        },
    },
};

/**
 * BullMQ Queue instance for processing incoming scraped opportunities.
 * This queue ensures that the main API thread is not blocked during
 * AI embedding generation and similarity matching.
 */
export const opportunityDeduplicationQueue = new Queue(
    'opportunity_deduplication',
    queueOptions
);

/**
 * Helper function to add a new opportunity to the deduplication queue.
 * @param opportunityData - The raw scraped opportunity data.
 * @returns The added BullMQ Job instance.
 */
export const addOpportunityToDeduplicationQueue = async (opportunityData: any) => {
    return await opportunityDeduplicationQueue.add(
        'process-deduplication',
        { opportunityData },
        {
            jobId: `dedup-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        }
    );
};
