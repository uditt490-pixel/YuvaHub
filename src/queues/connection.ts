import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const connection: any = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  enableOfflineQueue: false,
  family: 4,
  retryStrategy: (times) => {
    if (times > 3) {
      return null;
    }
    return 200;
  }
});

let redisErrorLogged = false;

connection.on('error', (err) => {
  if (!redisErrorLogged) {
    console.warn('[BullMQ Redis] Offline mode - Redis not detected. Background queues will run in-memory/direct fallback mode.');
    redisErrorLogged = true;
  }
});

connection.on('connect', () => {
  console.log('[BullMQ Redis] Connected successfully');
  redisErrorLogged = false;
});

export function isRedisReady(): boolean {
  return connection && connection.status === 'ready';
}

export { connection };
