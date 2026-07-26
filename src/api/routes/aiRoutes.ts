import { Router } from "express";
import { aiGenerate, aiResumeReview, handleCareerRoadmap, analyzeResume, generateOutreach } from "../controllers/aiController.js";
import { chatRateLimiter } from "../middlewares/rateLimiter.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.post("/ai/generate", authMiddleware, chatRateLimiter, aiGenerate);
router.post("/ai/resume-review", authMiddleware, chatRateLimiter, aiResumeReview);
router.post("/ai/career-roadmap", authMiddleware, chatRateLimiter, handleCareerRoadmap);
router.post("/ai/analyze-resume", authMiddleware, chatRateLimiter, analyzeResume);
router.post("/ai/outreach", authMiddleware, chatRateLimiter, generateOutreach);
export default router;

