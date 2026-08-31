import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import {
  acceptMentorshipRequest,
  declineMentorshipRequest,
  getAlumniDirectory,
  getAlumniProfile,
  getReceivedMentorshipRequests,
  getSentMentorshipRequests,
  requestMentorship,
  toggleMentoringPreference,
  updateUserProfile,
} from "../controllers/alumniController.js";

const router = Router();

router.patch("/users/:userId/profile", authMiddleware, updateUserProfile);
router.patch("/users/:userId/mentoring-preference", authMiddleware, toggleMentoringPreference);

router.get("/alumni/directory", getAlumniDirectory);
router.get("/alumni/:userId", getAlumniProfile);
router.post("/alumni/:userId/request-mentorship", authMiddleware, requestMentorship);
router.get("/alumni/requests/received", authMiddleware, getReceivedMentorshipRequests);
router.get("/alumni/requests/sent", authMiddleware, getSentMentorshipRequests);
router.patch("/alumni/requests/:requestId/accept", authMiddleware, acceptMentorshipRequest);
router.patch("/alumni/requests/:requestId/decline", authMiddleware, declineMentorshipRequest);

export default router;
