import { Router } from "express";
import {
  getAlumniMentors,
  registerAlumniMentor,
  bookAlumniMentorshipSession,
} from "../controllers/alumniMentorshipController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// Publicly browse and filter verified campus alumni mentors
router.get("/campus/mentorship/mentors", getAlumniMentors);

// Register as an alumni mentor for a campus
router.post("/campus/mentorship/mentors", authMiddleware, registerAlumniMentor);

// Book a 1-on-1 career guidance session with an alumni mentor
router.post("/campus/mentorship/mentors/:id/book", authMiddleware, bookAlumniMentorshipSession);

export default router;
