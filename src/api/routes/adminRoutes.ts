import { Router } from "express";
import { adminHealth, adminMetrics, adminScrapers, scraperStats, scraperLogs, triggerScraper, adminIncidents, adminDeleteUser, adminTelemetryStream, triggerNodeScraper } from "../controllers/adminController.js";
import { authMiddleware, adminOnly } from "../../middleware/auth.js";

const router = Router();

router.get("/admin/health", adminHealth);
router.get("/admin/metrics", authMiddleware, adminOnly, adminMetrics);
router.get("/admin/scrapers", authMiddleware, adminOnly, adminScrapers);
router.get("/admin/scrapers/stats", authMiddleware, adminOnly, scraperStats);
router.get("/admin/scrapers/logs", authMiddleware, adminOnly, scraperLogs);
router.post("/admin/scrapers/trigger", authMiddleware, adminOnly, triggerScraper);
router.get("/admin/incidents", authMiddleware, adminOnly, adminIncidents);
router.delete("/admin/users/:id", authMiddleware, adminOnly, adminDeleteUser);
router.get("/admin/telemetry", adminTelemetryStream);
router.post("/admin/trigger-node-scraper", authMiddleware, adminOnly, triggerNodeScraper);

export default router;
