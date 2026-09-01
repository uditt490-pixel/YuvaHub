import { Router } from "express";
import { authMiddleware as authenticate } from "../middlewares/auth.js";
import { 
  recommendCandidates, 
  sendTeamInvite, 
  respondToTeamInvite 
} from "../controllers/teamMatchmakerController.js";

const router = Router();

router.get("/teams/:teamId/recommend-candidates", authenticate, recommendCandidates);
router.post("/teams/:teamId/invite", authenticate, sendTeamInvite);
router.post("/invites/:inviteId/respond", authenticate, respondToTeamInvite);

export default router;
