import { Router } from 'express';
import { submitMentorshipFeedback } from '../controllers/feedbackController.js';

const router = Router();

router.post('/mentorship/feedback', submitMentorshipFeedback);

export default router;
