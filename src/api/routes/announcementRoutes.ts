import { Router } from "express";
import { authMiddleware, adminOnly } from "../middlewares/auth.js";
import { 
  listAnnouncements, 
  getActiveAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  dismissAnnouncement
} from "../controllers/announcementController.js";

const router = Router();

// Public / Semi-public routes (Active globally)
// Ensure getActiveAnnouncements is above /:id to avoid "active" being treated as an ID
router.get("/active", getActiveAnnouncements);

// General listings (Admin sees all, users see active only - handled in controller)
router.get("/", authMiddleware, listAnnouncements);

// Specific announcement (requires auth for views, etc)
router.get("/:id", authMiddleware, getAnnouncement);

// User action
router.post("/:id/dismiss", authMiddleware, dismissAnnouncement);

// Admin only routes
router.post("/", authMiddleware, adminOnly, createAnnouncement);
router.put("/:id", authMiddleware, adminOnly, updateAnnouncement);
router.delete("/:id", authMiddleware, adminOnly, deleteAnnouncement);

export default router;
