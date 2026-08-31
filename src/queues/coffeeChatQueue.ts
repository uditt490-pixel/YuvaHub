import { Queue, QueueOptions } from 'bullmq';
import { redisClient } from '../config/redis.js';

const queueOptions: QueueOptions = {
  connection: redisClient as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
  },
};

export const coffeeChatQueue = new Queue('coffeeChatQueue', queueOptions);

export const triggerWeeklyCoffeeChatLottery = async () => {
  return await coffeeChatQueue.add(
    'weekly-lottery-match',
    { timestamp: new Date().toISOString() },
    { jobId: `lottery-${Date.now()}` }
  );
};
