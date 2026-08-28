import { Router } from "express";
import {
  searchCandidates,
  initiateEmployerConnection,
} from "../controllers/employerController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// High-performance candidate search backend (filtering by skills, location, graduation year, min ATS score)
router.get("/employer/candidates", searchCandidates);

// Direct connection invitation router (restricted to verified employers)
router.post("/employer/connections", authMiddleware, initiateEmployerConnection);

export default router;
