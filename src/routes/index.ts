import { Router } from "express";
import { getCourseCatalog, getUserRoadmap, saveUserRoadmap } from "../api/controllers/academicRoadmapController.js";

export const apiRouter = Router();

apiRouter.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString(), architecture: "modular" });
});

apiRouter.get("/planner/catalog", getCourseCatalog);
apiRouter.get("/planner/roadmap", getUserRoadmap);
apiRouter.post("/planner/roadmap", saveUserRoadmap);
