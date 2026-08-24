import { Router } from "express";
import { 
  submitResource, 
  listResources, 
  getMySavedResources, 
  voteResource, 
  saveResource, 
  flagResource 
} from "../controllers/resourceController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// Public routes
router.get("/resources", listResources);

// Protected routes
router.use("/resources", authMiddleware);
router.post("/resources", submitResource);
router.get("/resources/saved", getMySavedResources);
router.post("/resources/:id/vote", voteResource);
router.post("/resources/:id/save", saveResource);
router.post("/resources/:id/flag", flagResource);

export default router;
