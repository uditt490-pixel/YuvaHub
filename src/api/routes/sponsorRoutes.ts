import { Router } from 'express';
import { getSponsorLeaderboard, getSponsorAnalytics, trackSponsorInteraction } from '../controllers/sponsorController';

const router = Router();

/**
 * @route   GET /api/sponsors/leaderboard
 * @desc    Get the global sponsor engagement leaderboard
 * @access  Public
 */
router.get('/leaderboard', getSponsorLeaderboard);

/**
 * @route   GET /api/sponsors/:sponsorId/analytics
 * @desc    Get detailed analytics for a specific sponsor
 * @access  Private (Sponsor/Organizer)
 */
router.get('/:sponsorId/analytics', getSponsorAnalytics);

/**
 * @route   POST /api/sponsors/track
 * @desc    Record a user interaction with a sponsor
 * @access  Public (or Private with user context)
 */
router.post('/track', trackSponsorInteraction);

export default router;
