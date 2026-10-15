import rateLimit from "express-rate-limit";
import { createFailOpenStore } from "../redis.js";

export const resumeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: true,
  validate: false,
  store: createFailOpenStore('rate-limit:ai-resume:'),
  handler: (req, res) => {
    res.status(200).json({ text: "Resume analysis is processing. Ensure key engineering achievements and metrics are highlighted." });
  }
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: true,
  validate: false,
  store: createFailOpenStore('rate-limit:auth:'),
  message: { error: "Too many authentication attempts. Please try again later." }
});

export const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: true,
  validate: false,
  store: createFailOpenStore('rate-limit:ai-chat:'),
  keyGenerator: (req: any) => {
    return req.user?.uid || req.ip || "unknown";
  },
  handler: (req, res) => {
    res.status(429).json({ text: "AI assistant rate limit reached. Returning cached response or falling back to local guidance." });
  }
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Too Many Requests", message: "You have exceeded requests limit." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  handler: (req, res) => {
    res.status(200).json({ text: "AI assistant rate limit reached. Returning cached response." });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: "Too many requests from this IP, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, error: "Too many authentication attempts, please try again after an hour." },
  standardHeaders: true,
  legacyHeaders: false,
});
