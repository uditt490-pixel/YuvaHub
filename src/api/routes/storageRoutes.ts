import { Router } from "express";
import { handleSignatureRequest, handleSaveUpload, handleLocalUpload, localUpload } from "../controllers/storageController.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.post("/storage/signature", authMiddleware, handleSignatureRequest);
router.post("/storage/save", authMiddleware, handleSaveUpload);
router.post("/storage/upload-local", localUpload.single("file"), handleLocalUpload);

export default router;
