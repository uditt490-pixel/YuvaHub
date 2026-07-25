import { Router } from "express";
import { authSync, refreshTokens, logout } from "../controllers/authController.js";

const router = Router();

// Used for dual-version registration in server.ts
router.post("/auth/sync", authSync);
router.post("/auth/refresh", refreshTokens);
router.post("/auth/logout", logout);

export default router;
