import { Router } from "express";
import { track, bufferStatus } from "../controllers/analyticsController.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.post("/analytics/track", authMiddleware, track);
router.get("/analytics/buffer-status", bufferStatus);

export default router;
