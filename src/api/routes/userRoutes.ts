import { Router } from "express";
import { syncUser, deleteAccount } from "../controllers/userController.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.get("/user/sync", authMiddleware, syncUser);
router.delete("/user", authMiddleware, deleteAccount);

export default router;
