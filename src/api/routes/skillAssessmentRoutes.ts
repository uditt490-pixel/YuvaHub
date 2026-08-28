import { Router } from "express";
import {
  generateSkillQuiz,
  evaluateSkillQuiz,
} from "../controllers/skillAssessmentController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// Generate dynamic multiple-choice question sets for skill testing
router.get("/skills/quiz/generate", generateSkillQuiz);

// Evaluate quiz answers, calculate score (> 80%), and award verified skill badge
router.post("/skills/quiz/submit", authMiddleware, evaluateSkillQuiz);

export default router;
