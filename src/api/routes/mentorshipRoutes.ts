import { Router } from "express";
import { getMentorAvailability, bookSession, getSessions, updateSessionStatus } from "../controllers/mentorshipController.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.get("/mentorship/availability", getMentorAvailability);
router.post("/mentorship/book", authMiddleware, bookSession);
router.get("/mentorship/sessions", authMiddleware, getSessions);
router.patch("/mentorship/sessions/status", authMiddleware, updateSessionStatus);

export default router;
