import { Router } from "express";
import { rsvpForEvent, cancelRsvp, getUserRsvps } from "../controllers/eventRsvpController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// RSVP for an event
router.post("/event-rsvps/:eventId", authMiddleware, rsvpForEvent);

// Cancel RSVP
router.delete("/event-rsvps/:eventId", authMiddleware, cancelRsvp);

// Get user's RSVPs
router.get("/event-rsvps", authMiddleware, getUserRsvps);

export default router;
