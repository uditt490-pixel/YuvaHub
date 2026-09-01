import { Router } from "express";
import {
  getPolls,
  createPoll,
  getPollById,
  deletePoll,
  voteOnPoll,
  closePoll
} from "../controllers/pollController.js";
import { authMiddleware, adminOnly } from "../middlewares/auth.js";
import { rewardPoints } from "../middlewares/rewardPoints.js";

const router = Router();

router.get("/polls", getPolls);
router.post("/polls", authMiddleware, rewardPoints("create_post"), createPoll);
router.get("/polls/:pollId", getPollById);
router.delete("/polls/:pollId", authMiddleware, adminOnly, deletePoll);
router.post("/polls/:pollId/vote", authMiddleware, rewardPoints("reply_forum"), voteOnPoll);
router.post("/polls/:pollId/close", authMiddleware, closePoll);

export default router;
