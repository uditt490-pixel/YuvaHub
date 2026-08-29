import { Redis } from 'ioredis';
import { config } from './env.js';

export const redis = config.REDIS_URL
  ? new Redis(config.REDIS_URL, { maxRetriesPerRequest: null })
  : new Redis({ lazyConnect: true, maxRetriesPerRequest: null });

export const redisClient = redis;
