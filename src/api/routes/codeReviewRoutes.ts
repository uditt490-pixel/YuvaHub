import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { 
  createReviewRequest, 
  listReviewRequests, 
  claimReview, 
  submitFeedback, 
  getMyReviews 
} from "../controllers/codeReviewController.js";

const router = Router();

router.use("/code-reviews", authMiddleware);

router.post("/code-reviews", createReviewRequest);
router.get("/code-reviews", listReviewRequests);
router.get("/code-reviews/mine", getMyReviews);
router.post("/code-reviews/:id/claim", claimReview);
router.post("/code-reviews/:id/feedback", submitFeedback);

export default router;
