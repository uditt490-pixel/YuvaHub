import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import {
  getGigs,
  createGig,
  submitProposal,
  selectStudent,
  submitDeliverable,
  acceptDeliverable
} from "../controllers/studentGigController.js";

const router = Router();

router.get("/gigs", authMiddleware, getGigs);
router.post("/gigs", authMiddleware, createGig);
router.post("/gigs/:id/proposals", authMiddleware, submitProposal);
router.post("/gigs/:id/select", authMiddleware, selectStudent);
router.post("/gigs/:id/deliverables", authMiddleware, submitDeliverable);
router.post("/gigs/:id/accept", authMiddleware, acceptDeliverable);

export default router;
