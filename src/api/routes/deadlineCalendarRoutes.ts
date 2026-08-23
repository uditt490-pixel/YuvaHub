import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { getCalendarEvents, setReminder, deleteReminder, exportICS } from "../controllers/deadlineCalendarController.js";

const router = Router();

router.get("/calendar/events", authMiddleware, getCalendarEvents);
router.post("/calendar/reminders", authMiddleware, setReminder);
router.delete("/calendar/reminders/:id", authMiddleware, deleteReminder);
router.get("/calendar/export.ics", authMiddleware, exportICS);

export default router;
