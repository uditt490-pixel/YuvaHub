import { Request, Response } from 'express';
import { VerifiableCredential } from '../../models/VerifiableCredential';
import { issueVerifiableCredential, revokeVerifiableCredential } from '../../services/credentialIssuer';
import { logger } from '../../utils/logger';

/**
 * Requests a VC for a specific earned badge.
 */
export const requestCredential = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.uid;
        const { badgeName, metadata } = req.body;

        if (!badgeName) {
            return res.status(400).json({ error: 'Badge name is required' });
        }

        // In production, verify the user actually earned this badge before issuing
        const newVC = await issueVerifiableCredential(userId, badgeName, metadata || {});

        res.status(201).json({
            message: 'Verifiable credential issued successfully',
            data: newVC
        });
    } catch (error) {
        logger.error({ err: error }, 'Error requesting credential:');
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Fetches all active verifiable credentials for a user (their "Wallet").
 */
export const getUserWallet = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.uid;

        const credentials = await VerifiableCredential.find({ userId, status: 'active' })
            .sort({ issueDate: -1 })
            .select('-__v');

        res.status(200).json({ data: credentials });
    } catch (error) {
        logger.error({ err: error }, 'Error fetching user wallet:');
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Exports a specific credential as a downloadable JSON file.
 */
export const exportCredential = async (req: Request, res: Response) => {
    try {
        const { credentialId } = req.params;
        const userId = (req as any).user?.uid;

        const credential = await VerifiableCredential.findOne({ _id: credentialId, userId });
        if (!credential) {
            return res.status(404).json({ error: 'Credential not found' });
        }

        // Format for W3C compliance
        const exportData = {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            ...credential.toObject(),
        };

        res.setHeader('Content-Type', 'application/ld+json');
        res.setHeader('Content-Disposition', `attachment; filename="credential-${credential.badgeName.replace(/\s+/g, '-').toLowerCase()}.json"`);

        res.status(200).json(exportData);
    } catch (error) {
        logger.error({ err: error }, 'Error exporting credential:');
        res.status(500).json({ error: 'Internal server error' });
    }
};
