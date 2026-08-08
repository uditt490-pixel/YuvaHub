import { Router } from "express";
import {
  getRecommendations,
  getMatchExplanation,
  parseProfileSkills,
  getPreferences,
  updatePreferences,
  recordInteraction,
  getCompleteness,
  checkAlerts
} from "../controllers/recommendationController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

router.get("/recommendations", authMiddleware, getRecommendations);
router.get("/recommendations/explanation/:id", authMiddleware, getMatchExplanation);
router.post("/recommendations/parse-profile", authMiddleware, parseProfileSkills);
router.get("/recommendations/preferences", authMiddleware, getPreferences);
router.put("/recommendations/preferences", authMiddleware, updatePreferences);
router.post("/recommendations/interaction", authMiddleware, recordInteraction);
router.get("/recommendations/completeness", authMiddleware, getCompleteness);
router.post("/recommendations/check-alerts", authMiddleware, checkAlerts);

export default router;
