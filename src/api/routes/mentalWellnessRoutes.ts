import { Router } from "express";
import {
  assignCounselorCheckIn,
  createMentalWellnessCheckIn,
  getMentalWellnessCheckIns,
} from "../controllers/mentalWellnessController.js";

const router = Router();

router.get("/campus/wellness/checkins", getMentalWellnessCheckIns);
router.post("/campus/wellness/checkins", createMentalWellnessCheckIn);
router.post("/campus/wellness/checkins/:checkInId/counselor", assignCounselorCheckIn);

export default router;
