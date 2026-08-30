import { Queue, QueueOptions } from 'bullmq';
import { redisClient } from '../config/redis';

const queueOptions: QueueOptions = {
    connection: redisClient,
    defaultJobOptions: {
        attempts: 2,
        backoff: {
            type: 'fixed',
            delay: 5000,
        },
        removeOnComplete: {
            age: 7200, // 2 hours
            count: 500,
        },
    },
};

export const contentAuditQueue = new Queue(
    'content_audit_pipeline',
    queueOptions
);

export const addContentToAuditQueue = async (contentId: string, contentType: 'event' | 'forum_post' | 'opportunity') => {
    return await contentAuditQueue.add(
        'analyze-content',
        { contentId, contentType },
        {
            jobId: `audit-${contentType}-${contentId}-${Date.now()}`,
        }
    );
};
