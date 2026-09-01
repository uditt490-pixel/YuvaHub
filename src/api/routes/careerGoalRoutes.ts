import { Router } from "express";
import { authMiddleware as requireAuth } from "../middlewares/auth.js";
import { 
  createGoal, 
  getGoals, 
  updateMilestone, 
  deleteGoal 
} from "../controllers/careerGoalController.js";

const router = Router();

router.use("/career-goals", requireAuth);

router.post("/career-goals", createGoal);
router.get("/career-goals", getGoals);
router.patch("/career-goals/:goalId/milestones/:milestoneId", updateMilestone);
router.delete("/career-goals/:goalId", deleteGoal);

export default router;
