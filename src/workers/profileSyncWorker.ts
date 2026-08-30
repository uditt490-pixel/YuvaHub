import { Worker, Job } from 'bullmq';
import { connection as redisClient } from '../queues/connection';
import { DeveloperProfile } from '../models/DeveloperProfile';
import { fetchGitHubStats } from '../services/githubService';
import { fetchLeetCodeStats } from '../services/leetcodeService';
import { logger } from '../utils/logger';

/**
 * BullMQ Worker to periodically refresh developer profile stats.
 * Scheduled to run every 48 hours to respect external API rate limits.
 */
export const profileSyncWorker = new Worker(
    'profile_sync',
    async (job: Job) => {
        const { userId } = job.data;
        logger.info(`Starting profile sync for user ${userId}`);

        try {
            const profile = await DeveloperProfile.findOne({ userId });
            if (!profile || (!profile.githubUsername && !profile.leetcodeUsername)) {
                logger.warn(`No syncable usernames found for user ${userId}`);
                return;
            }

            const updateData: any = { lastSyncedAt: new Date() };

            if (profile.githubUsername) {
                updateData.githubStats = await fetchGitHubStats(profile.githubUsername);
            }

            if (profile.leetcodeUsername) {
                updateData.leetcodeStats = await fetchLeetCodeStats(profile.leetcodeUsername);
            }

            await DeveloperProfile.findByIdAndUpdate(profile._id, updateData);
            logger.info(`Profile sync completed successfully for user ${userId}`);

            return { status: 'success', userId };
        } catch (error) {
            logger.error({ err: error }, `Profile sync failed for user ${userId}:`);
            throw error;
        }
    },
    { connection: redisClient }
);
