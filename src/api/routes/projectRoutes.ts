import { Router } from "express";
import { getProjects, getProjectById, createProject, toggleProjectUpvote, deleteProject, updateProject } from "../controllers/projectController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

router.get("/projects", getProjects);
router.get("/projects/:id", getProjectById);
router.post("/projects", createProject);
router.patch("/projects/:id", authMiddleware, updateProject);
router.post("/projects/:id/star", toggleProjectUpvote);
router.post("/projects/:id/upvote", toggleProjectUpvote);
router.delete("/projects/:id", authMiddleware, deleteProject);

export default router;
