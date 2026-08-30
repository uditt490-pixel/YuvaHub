import { Router } from "express";
import { getNote, upsertNote, deleteNote, bulkGetNotes } from "../controllers/opportunityNoteController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

router.get("/opportunity-notes/:opportunityId", authMiddleware, getNote);
router.post("/opportunity-notes", authMiddleware, upsertNote);
router.delete("/opportunity-notes/:opportunityId", authMiddleware, deleteNote);
router.post("/opportunity-notes/bulk", authMiddleware, bulkGetNotes);

export default router;
