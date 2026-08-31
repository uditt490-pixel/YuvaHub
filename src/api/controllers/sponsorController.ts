import { Request, Response } from 'express';
import { SponsorTier } from '../../models/SponsorTier';
import { recordSponsorEngagement } from '../../services/sponsorAnalyticsService';
import { logger } from '../../utils/logger';

/**
 * Fetches the global sponsor leaderboard, sorted by engagement score.
 */
export const getSponsorLeaderboard = async (req: Request, res: Response) => {
    try {
        const { limit = 10 } = req.query;

        const sponsors = await SponsorTier.find({ isActive: true })
            .sort({ engagementScore: -1, currentTier: 1 })
            .limit(Number(limit))
            .select('name logoUrl websiteUrl currentTier engagementScore resourcesProvided boothVisits');

        res.status(200).json({
            success: true,
            data: sponsors,
        });
    } catch (error) {
        logger.error('Error fetching sponsor leaderboard:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

/**
 * Fetches detailed analytics for a specific sponsor (for their dashboard).
 */
export const getSponsorAnalytics = async (req: Request, res: Response) => {
    try {
        const { sponsorId } = req.params;

        const sponsor = await SponsorTier.findById(sponsorId);
        if (!sponsor) {
            return res.status(404).json({ success: false, error: 'Sponsor not found' });
        }

        // Mock historical data for charts
        const historicalEngagement = [
            { day: 'Mon', score: sponsor.engagementScore - 50 },
            { day: 'Tue', score: sponsor.engagementScore - 30 },
            { day: 'Wed', score: sponsor.engagementScore - 15 },
            { day: 'Thu', score: sponsor.engagementScore - 5 },
            { day: 'Fri', score: sponsor.engagementScore },
        ];

        res.status(200).json({
            success: true,
            data: {
                ...sponsor.toObject(),
                historicalEngagement,
            },
        });
    } catch (error) {
        logger.error('Error fetching sponsor analytics:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

/**
 * Public endpoint to record a user interaction with a sponsor.
 */
export const trackSponsorInteraction = async (req: Request, res: Response) => {
    try {
        const { sponsorId, actionType } = req.body;

        if (!sponsorId || !actionType) {
            return res.status(400).json({ success: false, error: 'sponsorId and actionType are required' });
        }

        await recordSponsorEngagement(sponsorId, actionType);

        res.status(200).json({ success: true, message: 'Interaction recorded' });
    } catch (error) {
        logger.error('Error tracking sponsor interaction:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
