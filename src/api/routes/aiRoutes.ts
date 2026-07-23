import { Router } from "express";
import { aiGenerate, aiResumeReview, handleCareerRoadmap, analyzeResume } from "../controllers/aiController.js";
import { chatRateLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.post("/ai/generate", chatRateLimiter, aiGenerate);
router.post("/ai/resume-review", chatRateLimiter, aiResumeReview);
router.post("/ai/career-roadmap", chatRateLimiter, handleCareerRoadmap);
router.post("/ai/analyze-resume", chatRateLimiter, analyzeResume);

export default router;
