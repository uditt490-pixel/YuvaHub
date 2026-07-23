import rateLimit from "express-rate-limit";
import { createFailOpenStore } from "../redis.js";

export const resumeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: true,
  validate: false,
  store: createFailOpenStore('rate-limit:ai-resume:'),
  message: { error: "Too many resume review requests. Please try again later." }
});

export const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: true,
  validate: false,
  store: createFailOpenStore('rate-limit:ai-chat:'),
  keyGenerator: (req) => {
    return req.body?.userId || req.ip || "unknown";
  },
  message: { error: "Too many AI generation requests. Please try again after a minute." }
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: "Too Many Requests", message: "You have exceeded your 100 requests in 15 minutes limit!" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window for AI
  message: { error: "Too Many Requests", message: "You have exceeded your 10 AI requests in 15 minutes limit!" },
  standardHeaders: true,
  legacyHeaders: false,
});
