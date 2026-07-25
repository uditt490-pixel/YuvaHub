import { Router } from "express";
import { createTeam, listTeams, getTeamById, submitJoinRequest, getTeamRequests, respondToRequest } from "../controllers/teamController.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.post("/teams", authMiddleware, createTeam);
router.get("/teams", listTeams);
router.get("/teams/:id", getTeamById);
router.post("/teams/:id/join", authMiddleware, submitJoinRequest);
router.get("/teams/:id/requests", authMiddleware, getTeamRequests);
router.post("/teams/requests/:requestId/respond", authMiddleware, respondToRequest);

export default router;
