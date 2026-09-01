import { Router } from "express";
import { analyze, getHistory, getById, updateRoadmapItem, deleteAnalysis } from "../controllers/skillGapController.js";
import { authMiddleware } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { AnalyzeSkillGapInputSchema } from "../../models/skillGapSchema.js";
import { z } from "zod";

const router = Router();

router.post("/skill-gap/analyze", authMiddleware, validateRequest(z.object({ body: AnalyzeSkillGapInputSchema })), analyze);
router.get("/skill-gap/history", authMiddleware, getHistory);
router.get("/skill-gap/:id", authMiddleware, getById);
router.patch("/skill-gap/:id/roadmap/:skillIndex", authMiddleware, validateRequest(z.object({ body: z.object({ completed: z.boolean().optional() }) })), updateRoadmapItem);
router.delete("/skill-gap/:id", authMiddleware, deleteAnalysis);

export default router;
