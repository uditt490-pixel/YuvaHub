import { Router } from "express";
import { requireRole } from "../middleware/roleAuth";
import { getExpiryStats, getExpiredOpportunities, reactivateOpportunity, archiveOpportunity } from "../controllers/adminExpiryController";

export const adminExpiryRouter = Router();

// Protect all routes with admin role
adminExpiryRouter.use(requireRole(["admin"]));

adminExpiryRouter.get("/stats", getExpiryStats);
adminExpiryRouter.get("/expired", getExpiredOpportunities);
adminExpiryRouter.post("/:id/reactivate", reactivateOpportunity);
adminExpiryRouter.post("/:id/archive", archiveOpportunity);
