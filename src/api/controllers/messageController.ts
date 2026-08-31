import { Request, Response } from 'express';
import { DirectMessage } from '../../models/DirectMessage';
import { getConversationId } from '../../services/chatSocketService';
import { logger } from '../../utils/logger';

/**
 * Fetches the encrypted message history for a specific conversation.
 * The client is responsible for decrypting the content.
 */
export const getConversationHistory = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.uid;
        const { otherUserId } = req.params;
        const { limit = 50, skip = 0 } = req.query;

        if (!userId || !otherUserId) {
            return res.status(400).json({ success: false, error: 'User IDs are required' });
        }

        const conversationId = getConversationId(userId, otherUserId);

        const messages = await DirectMessage.find({ conversationId })
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(Number(skip))
            .select('senderId encryptedContent iv attachmentUrl attachmentName createdAt isRead')
            .lean();

        // Reverse to get chronological order
        const chronologicalMessages = messages.reverse();

        res.status(200).json({
            success: true,
            data: chronologicalMessages,
        });
    } catch (error) {
        logger.error('Error fetching conversation history:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

/**
 * Fetches a list of conversations the user is part of, with the latest message preview.
 */
export const getUserConversations = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.uid;

        // Aggregate to find unique conversations and their latest message
        const conversations = await DirectMessage.aggregate([
            {
                $match: {
                    $or: [{ senderId: userId }, { receiverId: userId }],
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: '$conversationId',
                    latestMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [{ $and: [{ $eq: ['$receiverId', userId] }, { $eq: ['$isRead', false] }] }, 1, 0],
                        },
                    },
                },
            },
            {
                $sort: { 'latestMessage.createdAt': -1 },
            },
        ]);

        res.status(200).json({
            success: true,
            data: conversations,
        });
    } catch (error) {
        logger.error('Error fetching user conversations:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
