import { Router } from "express";
import {
  getNotifications,
  markRead,
  markAsRead,
  markAllRead,
  markBulkRead,
} from "../controllers/notificationController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

router.get("/notifications", authMiddleware, getNotifications);
router.post("/notifications/:id/read", authMiddleware, markAsRead);
router.put("/notifications/:id/read", authMiddleware, markAsRead);
router.patch("/notifications/:id/read", authMiddleware, markAsRead);
router.post("/notifications/read-all", authMiddleware, markAllRead);
router.put("/notifications/read-bulk", authMiddleware, markBulkRead);

export default router;
