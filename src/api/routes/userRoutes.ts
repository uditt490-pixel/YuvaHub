import { Router } from "express";
import { syncUser, deleteAccount, getSavedOpportunities, getProfileProgress, getPublicProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/auth.js";
import { toggleMentoringPreference, updateUserProfile } from "../controllers/alumniController.js";

const router = Router();

router.get("/users/me/saved-opportunities", authMiddleware, getSavedOpportunities);
router.get("/user/sync", authMiddleware, syncUser);
router.delete("/user", authMiddleware, deleteAccount);
router.get("/users/me/profile-progress", authMiddleware, getProfileProgress);
router.get("/public/profile/:uid", getPublicProfile);
router.patch("/users/:userId/profile", authMiddleware, updateUserProfile);
router.patch("/users/:userId/mentoring-preference", authMiddleware, toggleMentoringPreference);

export default router;
