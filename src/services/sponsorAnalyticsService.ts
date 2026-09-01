import { redisClient } from '../config/redis';
import { SponsorTier } from '../models/SponsorTier';
import { logger } from '../utils/logger';

/**
 * Point values for different user interactions with sponsor content.
 */
const ENGAGEMENT_WEIGHTS = {
    RESOURCE_DOWNLOAD: 10,
    BOOTH_VISIT: 5,
    LINK_CLICK: 2,
    TIER_UPGRADE_BONUS: 500,
};

/**
 * Increments a sponsor's engagement score in Redis for fast aggregation,
 * and periodically syncs to MongoDB.
 * 
 * @param sponsorId - The MongoDB ObjectId of the sponsor.
 * @param actionType - The type of user interaction.
 */
export const recordSponsorEngagement = async (sponsorId: string, actionType: keyof typeof ENGAGEMENT_WEIGHTS) => {
    try {
        const points = ENGAGEMENT_WEIGHTS[actionType];
        const redisKey = `sponsor_engagement:${sponsorId}`;

        // Increment score in Redis sorted set (or simple string for single value)
        const newScore = await redisClient.incrby(redisKey, points);

        // Update specific metric counters in Redis hashes
        if (actionType === 'RESOURCE_DOWNLOAD') {
            await redisClient.hincrby(`sponsor_metrics:${sponsorId}`, 'resourcesProvided', 1);
        } else if (actionType === 'BOOTH_VISIT') {
            await redisClient.hincrby(`sponsor_metrics:${sponsorId}`, 'boothVisits', 1);
        }

        // Check for tier upgrade
        await checkAndUpgradeTier(sponsorId, newScore);

        logger.info(`Recorded ${actionType} for sponsor ${sponsorId}. New score: ${newScore}`);
    } catch (error) {
        logger.error({ error }, `Failed to record engagement for sponsor ${sponsorId}:`);
    }
};

/**
 * Evaluates if a sponsor qualifies for a tier upgrade based on their engagement score.
 */
const checkAndUpgradeTier = async (sponsorId: string, currentScore: number) => {
    let newTier: any = null;

    if (currentScore >= 5000) newTier = 'diamond';
    else if (currentScore >= 2500) newTier = 'platinum';
    else if (currentScore >= 1000) newTier = 'gold';
    else if (currentScore >= 500) newTier = 'silver';

    if (newTier) {
        const sponsor = await SponsorTier.findById(sponsorId);
        if (sponsor && sponsor.currentTier !== newTier) {
            const oldTier = sponsor.currentTier;
            sponsor.currentTier = newTier;
            sponsor.engagementScore = currentScore; // Sync score
            await sponsor.save();

            logger.info(`Sponsor ${sponsor.name} upgraded from ${oldTier} to ${newTier}!`);

            // Could trigger a notification or event here
        }
    }
};

/**
 * Syncs Redis engagement data back to MongoDB (to be run as a cron job).
 */
export const syncSponsorMetricsToDB = async () => {
    try {
        const sponsors = await SponsorTier.find({ isActive: true });

        for (const sponsor of sponsors) {
            const redisKey = `sponsor_engagement:${sponsor._id}`;
            const scoreStr = await redisClient.get(redisKey);

            if (scoreStr) {
                const score = parseInt(scoreStr, 10);
                const metrics = await redisClient.hgetall(`sponsor_metrics:${sponsor._id}`);

                sponsor.engagementScore = score;
                if (metrics.resourcesProvided) sponsor.resourcesProvided = parseInt(metrics.resourcesProvided, 10);
                if (metrics.boothVisits) sponsor.boothVisits = parseInt(metrics.boothVisits, 10);
                sponsor.lastUpdated = new Date();

                await sponsor.save();
            }
        }
        logger.info('Successfully synced sponsor metrics to MongoDB.');
    } catch (error) {
        logger.error({ error }, 'Error syncing sponsor metrics to DB:');
    }
};
