import { Router } from "express";
import { generateDraft, queueApplication } from "../controllers/applicationController.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.post("/application/draft", authMiddleware, generateDraft);
router.post("/application/queue", authMiddleware, queueApplication);

export default router;
