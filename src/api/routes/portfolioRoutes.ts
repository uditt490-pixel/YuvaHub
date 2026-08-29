import { Router } from "express";
import {
  getPortfolioHandler,
  updatePortfolioSettingsHandler,
} from "../controllers/portfolioController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// Public route to fetch portfolio JSON payload for username
router.get("/portfolio/:username", getPortfolioHandler);

// Authenticated route to update portfolio settings (template, color, sections)
router.put("/portfolio/settings", authMiddleware, updatePortfolioSettingsHandler);

export default router;
