import { Queue, QueueOptions } from 'bullmq';
import { redisClient } from '../config/redis';

/**
 * Queue options for the content checking pipeline.
 */
const queueOptions: QueueOptions = {
    connection: redisClient,
    defaultJobOptions: {
        attempts: 2,
        backoff: {
            type: 'fixed',
            delay: 5000,
        },
        removeOnComplete: {
            age: 86400, // 24 hours
            count: 1000,
        },
    },
};

/**
 * BullMQ Queue instance for asynchronous plagiarism and duplicate detection.
 */
export const contentCheckQueue = new Queue(
    'content_plagiarism_check',
    queueOptions
);

/**
 * Helper function to add new content to the checking queue.
 */
export const addContentToCheckQueue = async (postId: string, contentType: 'forum_post' | 'opportunity' | 'comment', text: string) => {
    return await contentCheckQueue.add(
        'check-similarity',
        { postId, contentType, text },
        {
            jobId: `check-${postId}-${Date.now()}`,
        }
    );
};
