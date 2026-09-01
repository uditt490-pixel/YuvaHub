import { Router } from "express";
import {
  generateDraft,
  queueApplication,
  createApplication,
  updateApplicationStatus,
  updateApplication,
  deleteApplication,
  getUserApplications
} from "../controllers/applicationController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

router.post(["/applications/generate-draft", "/applications/draft", "/application/draft"], authMiddleware, generateDraft);
router.post(["/applications/queue", "/application/queue"], authMiddleware, queueApplication);
router.post(["/applications", "/application"], authMiddleware, createApplication);
router.patch("/applications/:id/status", authMiddleware, updateApplicationStatus);
router.patch("/applications/:id", authMiddleware, updateApplication);
router.put("/applications/:id", authMiddleware, updateApplication);
router.delete("/applications/:id", authMiddleware, deleteApplication);
router.get(["/applications", "/application"], authMiddleware, getUserApplications);

export default router;
