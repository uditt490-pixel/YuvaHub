import { Router } from "express";
import { getNotifications, markRead, markAllRead } from "../controllers/notificationController.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.get("/notifications", authMiddleware, getNotifications);
router.post("/notifications/:id/read", authMiddleware, markRead);
router.post("/notifications/read-all", authMiddleware, markAllRead);

export default router;
