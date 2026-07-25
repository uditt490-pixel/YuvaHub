import { Router } from "express";
import { aiGenerate, aiResumeReview, handleCareerRoadmap, analyzeResume } from "../controllers/aiController.js";
import { aiLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.post("/ai/generate", aiLimiter, aiGenerate);
router.post("/ai/resume-review", aiLimiter, aiResumeReview);
router.post("/ai/career-roadmap", aiLimiter, handleCareerRoadmap);
router.post("/ai/analyze-resume", aiLimiter, analyzeResume);

export default router;
