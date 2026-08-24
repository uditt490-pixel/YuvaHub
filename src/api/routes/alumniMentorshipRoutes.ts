import { Router } from "express";
import {
  bookAlumniMentorshipSession,
  getAlumniMentorshipSlots,
  registerAlumniMentorshipSlot,
} from "../controllers/alumniMentorshipController.js";

const router = Router();

router.get("/campus/mentorship/mentors", getAlumniMentorshipSlots);
router.post("/campus/mentorship/mentors", registerAlumniMentorshipSlot);
router.post("/campus/mentorship/mentors/:slotId/book", bookAlumniMentorshipSession);

export default router;
