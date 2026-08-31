import { redisClient as apiRedisClient } from '../api/redis.js';

export const redisClient = apiRedisClient;
export const redis = apiRedisClient;
export default redisClient;
