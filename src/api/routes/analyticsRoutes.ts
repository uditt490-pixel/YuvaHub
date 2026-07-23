import { Router } from "express";
import { track, bufferStatus } from "../controllers/analyticsController.js";

const router = Router();

router.post("/analytics/track", track);
router.get("/analytics/buffer-status", bufferStatus);

export default router;
