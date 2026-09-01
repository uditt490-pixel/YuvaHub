import { Router } from "express";
import {
  triggerWeeklyNewsletter,
  previewNewsletter,
  unsubscribeNewsletter,
} from "../controllers/newsletterController.js";
import { authMiddleware, adminOnly } from "../middlewares/auth.js";

const router = Router();

// Preview newsletter for testing or personal profile digest
router.post("/newsletter/preview", previewNewsletter);

// Trigger batch weekly newsletter dispatch (Admin or automated cron)
router.post("/newsletter/trigger", authMiddleware, adminOnly, triggerWeeklyNewsletter);

// Public 1-click unsubscribe endpoint (supports both GET link from email and POST API)
router.get("/newsletter/unsubscribe", unsubscribeNewsletter);
router.post("/newsletter/unsubscribe", unsubscribeNewsletter);

export default router;
