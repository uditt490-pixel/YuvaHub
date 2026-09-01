import { Router } from "express";
import {
  getVentures,
  registerVenture,
  commitVentureInvestment,
} from "../controllers/studentVentureController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// Publicly browse and filter campus student ventures
router.get("/campus/ventures", getVentures);

// Register a new campus student venture startup
router.post("/campus/ventures", authMiddleware, registerVenture);

// Commit angel / VC micro-investment to a student startup
router.post("/campus/ventures/:id/invest", authMiddleware, commitVentureInvestment);

export default router;
