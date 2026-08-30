import { Router } from "express";
import { createCareerFair, getCareerFairs, addCompanyBooth, getCompanyBooths, dropResume } from "../api/controllers/virtualCareerFairController";
import { getCourseCatalog, getUserRoadmap, saveUserRoadmap } from "../api/controllers/academicRoadmapController.js";
import { adminExpiryRouter } from "./adminExpiryRoutes";

export const apiRouter = Router();

apiRouter.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString(), architecture: "modular" });
});

// Virtual Career Fair Routes
apiRouter.post("/career-fairs", createCareerFair);
apiRouter.get("/career-fairs", getCareerFairs);
apiRouter.post("/career-fairs/booths", addCompanyBooth);
apiRouter.get("/career-fairs/:fairId/booths", getCompanyBooths);
apiRouter.post("/career-fairs/booths/drop-resume", dropResume);

apiRouter.get("/planner/catalog", getCourseCatalog);
apiRouter.get("/planner/roadmap", getUserRoadmap);
apiRouter.post("/planner/roadmap", saveUserRoadmap);

// Admin Expiry Routes
apiRouter.use("/admin/expiry", adminExpiryRouter);
