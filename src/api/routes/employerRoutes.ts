import { Router } from "express";
import {
  searchCandidates,
  initiateEmployerConnection,
  getEmployerAnalytics,
  getEmployerPostings,
} from "../controllers/employerController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// High-performance candidate search backend (filtering by skills, location, graduation year, min ATS score)
router.get("/employer/candidates", searchCandidates);

// Direct connection invitation router (restricted to verified employers)
router.post("/employer/connections", authMiddleware, initiateEmployerConnection);

// Employer Analytics Dashboard Endpoints
router.get("/employer/analytics", authMiddleware, getEmployerAnalytics);
router.get("/employer/postings", authMiddleware, getEmployerPostings);

export default router;

