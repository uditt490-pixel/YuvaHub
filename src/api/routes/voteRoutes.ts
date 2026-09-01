import { Router } from "express";
import { toggleVote } from "../controllers/voteController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// Atomic Community Upvoting & Downvoting endpoint
router.post(["/community/vote", "/vote"], authMiddleware, toggleVote);

export default router;
