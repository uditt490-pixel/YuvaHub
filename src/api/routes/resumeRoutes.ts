import { Router } from "express";
import { handleListResumes, handleCreateResume, handleRenameResume, handleDeleteResume, handleSetDefaultResume, handleExportResumeToPDF } from "../controllers/resumeController.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.get("/resumes", authMiddleware, handleListResumes);
router.post("/resumes", authMiddleware, handleCreateResume);
router.put("/resumes/:id/rename", authMiddleware, handleRenameResume);
router.delete("/resumes/:id", authMiddleware, handleDeleteResume);
router.put("/resumes/:id/default", authMiddleware, handleSetDefaultResume);
router.get("/resumes/:id/export/pdf", authMiddleware, handleExportResumeToPDF);
export default router;
