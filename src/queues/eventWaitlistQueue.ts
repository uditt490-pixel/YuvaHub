import { Queue, QueueOptions } from 'bullmq';
import { redisClient } from '../config/redis';

/**
 * Queue options configured for reliability and delayed processing.
 */
const queueOptions: QueueOptions = {
    connection: redisClient,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: {
            age: 3600,
            count: 1000,
        },
        removeOnFail: {
            age: 24 * 3600,
        },
    },
};

/**
 * BullMQ Queue instance for processing event waitlist promotions.
 */
export const eventWaitlistQueue = new Queue(
    'event_waitlist_promotion',
    queueOptions
);

/**
 * Helper function to add a promotion job to the queue.
 * @param eventId - The ID of the event with an open spot.
 * @returns The added BullMQ Job instance.
 */
export const addWaitlistPromotionJob = async (eventId: string) => {
    return await eventWaitlistQueue.add(
        'promote-next-user',
        { eventId },
        {
            jobId: `waitlist-promote-${eventId}-${Date.now()}`,
        }
    );
};
