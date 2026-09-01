import { Request, Response } from 'express';
import { CodeSnippet } from '../../models/CodeSnippet';
import { logger } from '../../utils/logger';

/**
 * Creates a new code snippet.
 */
export const createSnippet = async (req: Request, res: Response) => {
    try {
        const { title, content, language, isPublic } = req.body;
        const authorId = (req as any).user?.uid;

        if (!title || !language) {
            return res.status(400).json({ error: 'Title and language are required' });
        }

        const newSnippet = await CodeSnippet.create({
            title,
            content: content || '// Start coding...',
            language,
            authorId,
            isPublic: isPublic || false,
        });

        res.status(201).json({ message: 'Snippet created', data: newSnippet });
    } catch (error) {
        logger.error({ err: error }, 'Error creating snippet:');
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Fetches a specific snippet by ID.
 */
export const getSnippet = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.uid;

        const snippet = await CodeSnippet.findById(id);
        if (!snippet) {
            return res.status(404).json({ error: 'Snippet not found' });
        }

        if (!snippet.isPublic && snippet.authorId.toString() !== userId) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        res.status(200).json({ data: snippet });
    } catch (error) {
        logger.error({ err: error }, 'Error fetching snippet:');
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Fetches public snippets for the community feed.
 */
export const getPublicSnippets = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const snippets = await CodeSnippet.find({ isPublic: true })
            .populate('authorId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('title language authorId createdAt activeSessions');

        const total = await CodeSnippet.countDocuments({ isPublic: true });

        res.status(200).json({
            data: snippets,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        logger.error({ err: error }, 'Error fetching public snippets:');
        res.status(500).json({ error: 'Internal server error' });
    }
};
