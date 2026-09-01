import { eventBus } from '../utils/eventBus.js';
import { User } from '../models/User.js';
import { ReputationLog } from '../models/ReputationLog.js';
import { redisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';

/**
 * Configuration mapping actions to point values.
 */
const POINT_RULES: Record<string, number> = {
    USER_COMPLETED_PROFILE: 50,
    OPPORTUNITY_SHARED: 20,
    DAILY_LOGIN: 5,
    FORUM_POST_HELPFUL: 30,
};

/**
 * Initializes listeners on the event bus to process reputation events.
 * Updates both MongoDB (for persistence) and Redis (for real-time leaderboards).
 */
export const initializeReputationWorker = () => {
    Object.keys(POINT_RULES).forEach((action) => {
        eventBus.on(action, async (data: { userId: string; [key: string]: any }) => {
            try {
                const points = POINT_RULES[action];
                if (!points) return;

                // 1. Update MongoDB
                const user = await (User as any).findByIdAndUpdate(
                    data.userId,
                    { $inc: { reputation_score: points } },
                    { new: true }
                );

                if (!user) {
                    logger.warn(`User ${data.userId} not found for reputation update`);
                    return;
                }

                // 2. Log the action
                await ReputationLog.create({
                    userId: data.userId,
                    action,
                    pointsAwarded: points,
                    description: `Awarded ${points} points for ${action}`,
                });

                // 3. Update Redis Sorted Set for real-time leaderboard
                // ZADD leaderboard score member
                await (redisClient as any).zadd('reputation_leaderboard_weekly', user.reputation_score, data.userId);

                logger.info(`Reputation updated for user ${data.userId}: +${points} points (${action})`);
            } catch (error) {
                (logger.error as any)({ error }, `Error processing reputation event ${action}:`);
            }
        });
    });
};
