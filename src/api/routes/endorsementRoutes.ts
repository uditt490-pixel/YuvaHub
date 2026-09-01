import { Router } from "express";
import { authMiddleware as requireAuth } from "../middlewares/auth.js";
import { endorseSkill, retractEndorsement, getEndorsements } from "../controllers/endorsementController.js";

const router = Router();

// Get endorsements (public info usually, but we require auth for now based on app context, or can be public)
// If we want public access to view endorsements on public portfolios, we might not requireAuth for GET.
router.get("/endorsements", getEndorsements);

router.post("/endorsements", requireAuth, endorseSkill);
router.delete("/endorsements", requireAuth, retractEndorsement);

export default router;
