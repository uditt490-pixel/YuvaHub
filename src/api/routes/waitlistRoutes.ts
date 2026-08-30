import { Router } from 'express';
import { joinWaitlist, claimWaitlistSpot, getWaitlistStatus } from '../controllers/waitlistController';
// import { authenticate } from '../../middleware/auth'; // Assume this exists

const router = Router();

// router.use(authenticate);

router.post('/:eventId/join', joinWaitlist);
router.post('/claim', claimWaitlistSpot);
router.get('/:eventId/status', getWaitlistStatus);

export default router;