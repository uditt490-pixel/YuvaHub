import { Router } from "express";
import { getFolders, createFolder, deleteFolder, organizeBookmark } from "../controllers/bookmarkFolderController.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.get("/bookmark-folders", authMiddleware, getFolders);
router.post("/bookmark-folders", authMiddleware, createFolder);
router.delete("/bookmark-folders/:folderId", authMiddleware, deleteFolder);
router.post("/bookmarks/organize", authMiddleware, organizeBookmark);

export default router;
