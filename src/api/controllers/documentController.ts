import { Request, Response } from 'express';
import { SecureDocument } from '../../models/SecureDocument';
import { eventWaitlistQueue } from '../../queues/eventWaitlistQueue'; // Reusing queue import pattern
import { logger } from '../../utils/logger';
import crypto from 'crypto';

/**
 * Handles document upload and queues it for redaction.
 */
export const uploadDocument = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.uid;
        const { fileName, storageUrl } = req.body; // Mocked from multer/cloudinary upload

        if (!fileName || !storageUrl) {
            return res.status(400).json({ error: 'File name and storage URL are required' });
        }

        const newDoc = await SecureDocument.create({
            userId,
            originalFileName: fileName,
            storageUrl,
            status: 'pending',
        });

        // Queue for background processing
        await eventWaitlistQueue.add('document_processing', { documentId: newDoc._id }, { delay: 500 });

        res.status(201).json({
            message: 'Document uploaded and queued for redaction',
            data: { id: newDoc._id, status: newDoc.status }
        });
    } catch (error) {
        logger.error({ err: error }, 'Error uploading document:');
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Generates a secure, time-limited sharing link for a redacted document.
 */
export const generateShareLink = async (req: Request, res: Response) => {
    try {
        const { documentId } = req.params;
        const userId = (req as any).user?.uid;

        const doc = await SecureDocument.findOne({ _id: documentId, userId });
        if (!doc) {
            return res.status(404).json({ error: 'Document not found or access denied' });
        }

        if (doc.status !== 'completed' || !doc.redactedStorageUrl) {
            return res.status(400).json({ error: 'Document is not ready for sharing' });
        }

        const shareToken = crypto.randomBytes(32).toString('hex');
        const shareExpiresAt = new Date();
        shareExpiresAt.setDate(shareExpiresAt.getDate() + 7); // 7 days

        doc.accessLevel = 'shared';
        doc.shareToken = shareToken;
        doc.shareExpiresAt = shareExpiresAt;
        await doc.save();

        const shareUrl = `${process.env.FRONTEND_URL}/shared/doc/${shareToken}`;

        res.status(200).json({ message: 'Share link generated', data: { shareUrl, expiresAt: shareExpiresAt } });
    } catch (error) {
        logger.error({ err: error }, 'Error generating share link:');
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Fetches a list of the user's secure documents.
 */
export const getUserDocuments = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.uid;
        const docs = await SecureDocument.find({ userId }).sort({ createdAt: -1 }).select('-shareToken');
        res.status(200).json({ data: docs });
    } catch (error) {
        logger.error({ err: error }, 'Error fetching user documents:');
        res.status(500).json({ error: 'Internal server error' });
    }
};
