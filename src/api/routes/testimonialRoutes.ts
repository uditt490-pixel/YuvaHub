import { Router } from "express";
import { authMiddleware as requireAuth } from "../middlewares/auth.js";
import { 
    createTestimonial, 
    getPublicTestimonials, 
    getTestimonialInbox, 
    updateTestimonialStatus, 
    toggleHighlight 
} from "../controllers/testimonialController.js";

const router = Router();

// Public routes
router.get("/testimonials/public/:uid", getPublicTestimonials);

// Protected routes
router.use("/testimonials", requireAuth);
router.post("/testimonials", createTestimonial);
router.get("/testimonials/inbox", getTestimonialInbox);
router.patch("/testimonials/:id/status", updateTestimonialStatus);
router.patch("/testimonials/:id/highlight", toggleHighlight);

export default router;
