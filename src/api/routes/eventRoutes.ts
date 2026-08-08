import { Router } from "express";
import {
  getEvents,
  createEvent,
  rsvpEvent,
  cancelRsvp,
  getWaitlist,
} from "../controllers/eventController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// List all events (public; user status enriched when authenticated)
router.get("/events", getEvents);

// Create a new event (authenticated)
router.post("/events", authMiddleware, createEvent);

// RSVP or join waitlist (authenticated)
router.post("/events/:eventId/rsvp", authMiddleware, rsvpEvent);

// Cancel RSVP / leave waitlist (authenticated)
router.delete("/events/:eventId/rsvp", authMiddleware, cancelRsvp);

// View current waitlist for an event (authenticated)
router.get("/events/:eventId/waitlist", authMiddleware, getWaitlist);

export default router;
