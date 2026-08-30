import { Router } from "express";
import {
    adminHealth,
    adminMetrics,
    adminScrapers,
    adminScraperHealth,
    scraperStats,
    scraperLogs,
    triggerScraper,
    adminIncidents,
    adminDeleteUser,
    adminTelemetryStream,
    triggerNodeScraper,
    adminDlqStats,
    adminInspectDlq,
    adminReplayDlq,
    adminPurgeDlq,
    getPlatformStats,
    getUsersList,
    performModerationAction,
    getScraperConfigs,
    updateScraperConfig
} from "../controllers/adminController.js";
import { authMiddleware, adminOnly } from "../middlewares/auth.js";
import { requireRole } from "../../middleware/roleAuth.js";

const router = Router();

// ── New Platform & Moderation Routes ─────────────────────────────────────
// All routes in this section require 'admin' or 'moderator' role
const protectAdmin = requireRole(['admin', 'moderator']);

router.get('/stats', protectAdmin, getPlatformStats);
router.get('/users', protectAdmin, getUsersList);
router.post('/moderate', protectAdmin, performModerationAction);

// ── Existing Admin Routes ────────────────────────────────────────────────
router.get("/admin/health", adminHealth);
router.get("/admin/metrics", authMiddleware, adminOnly, adminMetrics);
router.get("/admin/scrapers", authMiddleware, adminOnly, adminScrapers);
router.get("/admin/scraper-health", authMiddleware, adminOnly, adminScraperHealth);
router.get("/admin/scrapers/stats", authMiddleware, adminOnly, scraperStats);
router.get("/admin/scrapers/logs", authMiddleware, adminOnly, scraperLogs);
router.post("/admin/scrapers/trigger", authMiddleware, adminOnly, triggerScraper);
router.post("/admin/scrapers/trigger/:sourceId", authMiddleware, adminOnly, triggerScraper);
router.get("/admin/scrapers/configs", authMiddleware, adminOnly, getScraperConfigs);
router.patch("/admin/scrapers/configs/:sourceId", authMiddleware, adminOnly, updateScraperConfig);
router.get("/admin/incidents", authMiddleware, adminOnly, adminIncidents);
router.delete("/admin/users/:id", authMiddleware, adminOnly, adminDeleteUser);
router.get("/admin/telemetry", adminTelemetryStream);
router.post("/admin/trigger-node-scraper", authMiddleware, adminOnly, triggerNodeScraper);

router.get("/admin/dlq/stats", authMiddleware, adminOnly, adminDlqStats);
router.get("/admin/dlq/inspect/:queueName", authMiddleware, adminOnly, adminInspectDlq);
router.post("/admin/dlq/replay/:queueName", authMiddleware, adminOnly, adminReplayDlq);
router.delete("/admin/dlq/purge/:queueName", authMiddleware, adminOnly, adminPurgeDlq);

export default router;
