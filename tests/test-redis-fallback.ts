import { createServer } from "http";
import express from "express";
import rateLimit, { MemoryStore } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import Redis from "ioredis";

declare global {
  var REDIS_AVAILABLE: boolean;
}

import { describe, it, expect } from 'vitest';

describe('tests/test-redis-fallback.ts', () => {
  it('should execute without errors', async () => {
    try {
      console.log("Starting Redis Fallback Automated Test...");
      global.REDIS_AVAILABLE = false;

      const redisClient = new Redis("redis://localhost:9999", {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy: () => null
      });

      redisClient.on('error', () => {
        global.REDIS_AVAILABLE = false;
      });

      const createFailOpenStore = (prefix: string) => {
        const fallbackStore = new MemoryStore();
        const store = new RedisStore({
          sendCommand: (...args: string[]) => {
            const [command, ...commandArgs] = args;
            return redisClient.call(command, ...commandArgs) as Promise<any>;
          },
          prefix: prefix,
        });

        return {
          ...fallbackStore,
          increment: async (key: string) => {
            if (global.REDIS_AVAILABLE && store) {
              try { return await store.increment(key); } catch (err: any) { global.REDIS_AVAILABLE = false; }
            }
            return fallbackStore.increment(key);
          },
          decrement: async (key: string) => {
            if (global.REDIS_AVAILABLE && store) {
              try { return await store.decrement(key); } catch(e) { global.REDIS_AVAILABLE = false; }
            }
            if (fallbackStore.decrement) return fallbackStore.decrement(key);
          },
          resetKey: async (key: string) => {
            if (global.REDIS_AVAILABLE && store) {
              try { return await store.resetKey(key); } catch(e) { global.REDIS_AVAILABLE = false; }
            }
            if (fallbackStore.resetKey) return fallbackStore.resetKey(key);
          },
        };
      };

      const app = express();
      const limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 2,
        store: createFailOpenStore('test:'),
        message: { error: "Too many requests" }
      });
      app.use("/api", limiter, (req, res) => { res.status(200).json({ ok: true }); });

      const server = createServer(app);
      
      await new Promise<void>((resolve, reject) => {
        server.listen(3005, async () => {
          try {
            console.log("? Mock server started on port 3005");
            const r1 = await fetch("http://localhost:3005/api");
            if (r1.status !== 200) throw new Error("Req 1 failed");

            const r2 = await fetch("http://localhost:3005/api");
            if (r2.status !== 200) throw new Error("Req 2 failed");

            const r3 = await fetch("http://localhost:3005/api");
            if (r3.status !== 429) throw new Error("Req 3 should be 429 rate limited");

            console.log("? Fallback Rate Limiting works as expected via MemoryStore!");
            server.close();
            try { redisClient.disconnect(); } catch (err) {}
            resolve();
          } catch (e: any) {
            server.close();
            try { redisClient.disconnect(); } catch (err) {}
            reject(e);
          }
        });
      });
    } catch (e: any) {
      console.warn("Test failed:", e.message);
      throw e;
    }
  });
});
