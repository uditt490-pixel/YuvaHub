import { Router } from "express";
import { z } from "zod";
import { createScholarship, getScholarships, getScholarshipById, updateScholarship, deleteScholarship, validateEligibility } from "../controllers/scholarshipController.js";
import { authMiddleware, adminOnly } from "../../middleware/auth.js";
import { cacheMiddleware } from "../middlewares/cacheMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { ScholarshipSchema } from "../../models/scholarshipSchema.js";

const router = Router();

router.post("/scholarships", authMiddleware, adminOnly, validateRequest(z.object({ body: ScholarshipSchema })), createScholarship);
router.get("/scholarships", cacheMiddleware(300), getScholarships);
router.get("/scholarships/:id", cacheMiddleware(3600, (req: any) => `scholarship:${req.params.id}`), getScholarshipById);
router.put("/scholarships/:id", authMiddleware, adminOnly, validateRequest(z.object({ body: ScholarshipSchema })), updateScholarship);
router.delete("/scholarships/:id", authMiddleware, adminOnly, deleteScholarship);
router.post("/scholarships/validate", authMiddleware, validateEligibility);

export default router;
