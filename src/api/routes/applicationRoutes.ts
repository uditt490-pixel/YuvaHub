import { Router } from "express";
import { generateDraft, queueApplication } from "../controllers/applicationController.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.post(["/applications/generate-draft", "/applications/draft", "/application/draft"], authMiddleware, generateDraft);
router.post(["/applications/queue", "/application/queue"], authMiddleware, queueApplication);

export default router;
