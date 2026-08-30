import { Router } from "express";
import { track, bufferStatus, getPersonalInsights, getAdminDashboardMetrics } from "../controllers/analyticsController.js";
import { authMiddleware, adminOnly } from "../middlewares/auth.js";

const router = Router();

router.post("/analytics/track", authMiddleware, track);
router.get("/analytics/buffer-status", bufferStatus);
router.get("/analytics/insights", authMiddleware, getPersonalInsights);
router.get("/analytics/admin/dashboard", authMiddleware, adminOnly, getAdminDashboardMetrics);

export default router;
