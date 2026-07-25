import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const connection: any = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  }
});

connection.on('error', (err) => {
  console.error('[BullMQ Redis] Connection error:', err.message);
});

export { connection };
