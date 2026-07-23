import { Router } from "express";
import { authSync } from "../controllers/authController.js";

const router = Router();

// Used for dual-version registration in server.ts
router.post("/auth/sync", authSync);

export default router;
