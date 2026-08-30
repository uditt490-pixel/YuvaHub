import { Request, Response } from 'express';
import { DeveloperProfile } from '../../models/DeveloperProfile';
// Reusing queue import structure
import { logger } from '../../utils/logger';

/**
 * Links GitHub and/or LeetCode usernames to a user's profile and triggers initial sync.
 */
export const linkDeveloperAccounts = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.uid;
        const { githubUsername, leetcodeUsername } = req.body;

        let profile = await DeveloperProfile.findOne({ userId });

        if (!profile) {
            profile = new DeveloperProfile({ userId, githubUsername, leetcodeUsername });
        } else {
            if (githubUsername) profile.githubUsername = githubUsername;
            if (leetcodeUsername) profile.leetcodeUsername = leetcodeUsername;
        }

        await profile.save();

        // Trigger immediate sync job
        // await opportunityDeduplicationQueue.add('profile_sync', { userId }, { delay: 1000 });

        res.status(200).json({ message: 'Accounts linked successfully', data: profile });
    } catch (error) {
        logger.error({ err: error }, 'Error linking developer accounts:');
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Fetches the complete developer profile with stats for frontend rendering.
 */
export const getDeveloperProfile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const profile = await DeveloperProfile.findOne({ userId });

        if (!profile) {
            return res.status(404).json({ error: 'Developer profile not found' });
        }

        res.status(200).json({ data: profile });
    } catch (error) {
        logger.error({ err: error }, 'Error fetching developer profile:');
        res.status(500).json({ error: 'Internal server error' });
    }
};
