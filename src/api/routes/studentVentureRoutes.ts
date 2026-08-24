import { Router } from "express";
import {
  commitStudentVentureInvestment,
  getStudentVentures,
  registerStudentVenture,
} from "../controllers/studentVentureController.js";

const router = Router();

router.get("/campus/ventures", getStudentVentures);
router.post("/campus/ventures", registerStudentVenture);
router.post("/campus/ventures/:ventureId/invest", commitStudentVentureInvestment);

export default router;
