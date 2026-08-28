import { Router } from "express";
import { getReplies, createReply, upvoteReply, acceptAnswer } from "../controllers/forumReplyController.js";
import { authMiddleware } from "../middlewares/auth.js";
import { rewardPoints } from "../middlewares/rewardPoints.js";

const router = Router();

router.get("/community/posts/:postId/replies", getReplies);
router.post("/community/posts/:postId/replies", authMiddleware, rewardPoints("reply_forum"), createReply);
router.post("/community/posts/:postId/replies/:replyId/upvote", authMiddleware, upvoteReply);
router.put("/community/posts/:postId/replies/:replyId/accept", authMiddleware, acceptAnswer);

export default router;
