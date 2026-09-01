import { Router } from "express";
import { submitReport, getModerationQueue, resolveReport, getReportStats } from "../controllers/reportController.js";
import { authMiddleware, adminOnly } from "../middlewares/auth.js";

const router = Router();

// User facing route to submit a report
router.post("/reports", authMiddleware, submitReport);

// Admin moderation routes
router.get("/reports/queue", authMiddleware, adminOnly, getModerationQueue);
router.post("/reports/:id/resolve", authMiddleware, adminOnly, resolveReport);
router.get("/reports/stats", authMiddleware, adminOnly, getReportStats);

export default router;
