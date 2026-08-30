import { Request, Response } from 'express';
import { User } from '../../models/User.js';
import { ReputationLog } from '../../models/ReputationLog.js';
import { redis as redisClient } from '../../config/redis.js';
import { logger } from '../../utils/logger.js';

/**
 * Fetches the real-time weekly leaderboard from Redis.
 */
export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;

        // ZREVRANGE to get top scores
        const topUsers = await redisClient.zrange('reputation_leaderboard_weekly', 0, limit - 1, 'REV');

        // Fetch user details for the top IDs
        const userDetails = await User.find(
            { _id: { $in: topUsers } },
            'name reputation_score level badges'
        ).sort({ reputation_score: -1 });

        res.status(200).json({ data: userDetails });
    } catch (error) {
        (logger.error as any)({ error }, 'Error fetching leaderboard:');
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Fetches detailed reputation history for a specific user.
 */
export const getUserReputationHistory = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const logs = await ReputationLog.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await ReputationLog.countDocuments({ userId });

        res.status(200).json({
            data: logs,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        (logger.error as any)({ error }, 'Error fetching user reputation history:');
        res.status(500).json({ error: 'Internal server error' });
    }
};
