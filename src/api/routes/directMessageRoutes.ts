import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import {
  listConversations,
  getConversation,
  sendMessage,
  markAsRead,
} from "../controllers/directMessageController.js";

const router = Router();

// Ensure all DM routes are authenticated
router.use(authMiddleware);

router.get("/dm/conversations", listConversations);
router.get("/dm/conversations/:recipientId", getConversation);
router.post("/dm/conversations/:recipientId", sendMessage);
router.patch("/dm/conversations/:recipientId/read", markAsRead);

export default router;
