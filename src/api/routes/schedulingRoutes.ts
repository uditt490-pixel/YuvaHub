import { Router } from "express";
import {
  getAvailability,
  bookInterviewHandler,
  saveCalendarTokenHandler,
} from "../controllers/schedulingController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// Fetch student free availability slots
router.get("/scheduling/availability/:studentId", getAvailability);

// Book an interview slot and auto-generate meeting link
router.post("/scheduling/book", authMiddleware, bookInterviewHandler);

// Connect calendar OAuth token (Google / Outlook)
router.post("/scheduling/oauth/token", authMiddleware, saveCalendarTokenHandler);

export default router;
