import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { getCourseCatalog, getUserRoadmap, saveUserRoadmap } from "../controllers/academicRoadmapController.js";

const router = Router();

router.get("/planner/catalog", getCourseCatalog);
router.get("/planner/roadmap", authMiddleware, getUserRoadmap);
router.post("/planner/roadmap", authMiddleware, saveUserRoadmap);

export default router;