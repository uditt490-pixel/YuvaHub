import { Router } from "express";
import { getBookmarks, addBookmark, deleteBookmark } from "../controllers/bookmarkController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

router.get("/bookmarks", authMiddleware, getBookmarks);
router.post("/bookmarks", authMiddleware, addBookmark);
router.delete("/bookmarks/:opportunityId", authMiddleware, deleteBookmark);

export default router;
