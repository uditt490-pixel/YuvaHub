import { Router } from "express";
import { syncUser, deleteAccount, getSavedOpportunities, getProfileProgress } from "../controllers/userController.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.get("/users/me/saved-opportunities", authMiddleware, getSavedOpportunities);
router.get("/user/sync", authMiddleware, syncUser);
router.delete("/user", authMiddleware, deleteAccount);
router.get("/users/me/profile-progress", authMiddleware, getProfileProgress);

export default router;
