import { Router } from "express";
import { z } from "zod";
import { getBounties, createBounty, acceptBounty, resolveBounty, rateBounty, getLeaderboard } from "../controllers/bountyController.js";
import { authMiddleware } from "../../middleware/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { BountySchema } from "../../models/bountySchema.js";

const router = Router();

router.get("/bounties", getBounties);
router.post("/bounties", authMiddleware, validateRequest(z.object({ body: BountySchema })), createBounty);
router.post("/bounties/:id/accept", authMiddleware, acceptBounty);
router.post("/bounties/:id/resolve", authMiddleware, resolveBounty);
router.post("/bounties/:id/rate", authMiddleware, rateBounty);
router.get("/bounties/leaderboard", getLeaderboard);

export default router;
