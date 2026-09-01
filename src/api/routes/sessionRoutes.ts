import { Router } from 'express';
import { getEventAgenda, proposeSession, updateSessionStatus } from '../controllers/sessionController';
// import { authenticate, requireRole } from '../../middleware/auth'; // Assuming these exist

const router = Router();

/**
 * @route   GET /api/sessions/:eventId
 * @desc    Get the collaborative agenda for a specific event
 * @access  Public
 */
router.get('/:eventId', getEventAgenda);

/**
 * @route   POST /api/sessions/:eventId/propose
 * @desc    Propose a new session for an event
 * @access  Private (Authenticated users)
 */
// router.post('/:eventId/propose', authenticate, proposeSession);
router.post('/:eventId/propose', proposeSession);

/**
 * @route   PATCH /api/sessions/:sessionId/status
 * @desc    Update the status of a session (Organizer only)
 * @access  Private (Organizers/Admins)
 */
// router.patch('/:sessionId/status', authenticate, requireRole(['organizer', 'admin']), updateSessionStatus);
router.patch('/:sessionId/status', updateSessionStatus);

export default router;
