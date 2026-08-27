import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.js";
import {
  getUserActivity,
  getActivityStats,
  getDigestPreferences,
  setDigestPreference
} from "../controllers/activityController.js";

const router = Router();

router.use("/activity", authenticateUser());

router.get("/activity/feed", getUserActivity);
router.get("/activity/stats", getActivityStats);
router.get("/activity/digest-preferences", getDigestPreferences);
router.put("/activity/digest-preferences", setDigestPreference);

export default router;
