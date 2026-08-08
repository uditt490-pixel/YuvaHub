import { Router } from "express";
import { authSync, refreshTokens, logout, login, signup, forgotPassword } from "../controllers/authController.js";
import { authRateLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Used for dual-version registration in server.ts
router.post("/auth/sync", authSync);
router.post("/auth/refresh", refreshTokens);
router.post("/auth/logout", logout);

// Proxy endpoints with rate limiting to prevent enumeration and credential stuffing
router.post("/login", authRateLimiter, login);
router.post("/signup", authRateLimiter, signup);
router.post("/forgot-password", authRateLimiter, forgotPassword);

export default router;
