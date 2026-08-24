import { Router } from "express";
import {
  contributeToAlumniEndowment,
  createAlumniEndowment,
  getAlumniEndowments,
} from "../controllers/alumniEndowmentController.js";

const router = Router();

router.get("/campus/endowments", getAlumniEndowments);
router.post("/campus/endowments", createAlumniEndowment);
router.post("/campus/endowments/:fundId/contribute", contributeToAlumniEndowment);

export default router;
