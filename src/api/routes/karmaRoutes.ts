import { Router } from "express";
import { getKarmaBalance, awardKarma } from "../controllers/karmaController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

router.get("/karma/balance", authMiddleware, getKarmaBalance);
router.post("/karma/award", authMiddleware, awardKarma);

export default router;
