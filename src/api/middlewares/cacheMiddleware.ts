import express from "express";
import { redisClient } from "../redis.js";

export const cacheMiddleware = (ttlSeconds: number, keyGenerator?: (req: express.Request) => string) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!redisClient || redisClient.status !== 'ready') {
      res.setHeader("X-Cache-Status", "BYPASS");
      return next();
    }

    const key = keyGenerator ? keyGenerator(req) : req.originalUrl;

    try {
      const cached = await redisClient.get(key);
      if (cached) {
        res.setHeader("X-Cache-Status", "HIT");
        return res.json(JSON.parse(cached));
      }
    } catch (err) {
      console.error("[Cache] Redis get error:", err);
    }

    res.setHeader("X-Cache-Status", "MISS");

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      try {
        if (redisClient && redisClient.status === 'ready' && res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.set(key, JSON.stringify(body), "EX", ttlSeconds).catch((err: any) => {
            console.error("[Cache] Redis set error:", err);
          });
        }
      } catch (err) {
        console.error("[Cache] Error stringifying response:", err);
      }
      return originalJson(body);
    };

    next();
  };
};
