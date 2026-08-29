import { Router } from "express";
import {
  getAlumniMentors,
  registerAlumniMentor,
  bookAlumniMentorshipSession,
  createMentorshipIntroduction,
  getAlumniDirectory,
  updateAlumniProfileStatus,
} from "../controllers/alumniMentorshipController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// Publicly browse and filter verified campus alumni mentors
router.get("/campus/mentorship/mentors", getAlumniMentors);

// Register as an alumni mentor for a campus
router.post("/campus/mentorship/mentors", authMiddleware, registerAlumniMentor);

// Book a 1-on-1 career guidance session with an alumni mentor
router.post("/campus/mentorship/mentors/:id/book", authMiddleware, bookAlumniMentorshipSession);

// Searchable Alumni Directory with university, current company, role & mentorship filters
router.get("/alumni/directory", getAlumniDirectory);

// Transition profile from Student to Alumni & toggle Mentorship Opt-in status
router.put("/alumni/profile/status", authMiddleware, updateAlumniProfileStatus);

// Masked Mentorship Communication Request Handler
router.post("/mentorship/introduction", authMiddleware, createMentorshipIntroduction);

export default router;
