import { VerifiableCredential } from '../models/VerifiableCredential';
import { formatAsJSONLD, generateMockProof } from '../utils/vcUtils';
import { logger } from '../utils/logger';

/**
 * Issues a new Verifiable Credential for a user's earned badge.
 */
export const issueVerifiableCredential = async (userId: string, badgeName: string, metadata: any) => {
    try {
        // 1. Format the credential data
        const vcData = formatAsJSONLD(badgeName, userId, metadata);

        // 2. Generate cryptographic proof
        const proof = generateMockProof(vcData);

        // 3. Combine into final VC structure
        const finalVC = {
            ...vcData,
            proof,
        };

        // 4. Save to database
        const newCredential = await VerifiableCredential.create({
            userId,
            badgeName,
            issuer: finalVC.issuer,
            issueDate: new Date(finalVC.issuanceDate),
            credentialSubject: finalVC.credentialSubject,
            proof: finalVC.proof,
            status: 'active',
        });

        logger.info(`Issued VC for badge: ${badgeName} to user: ${userId}`);
        return newCredential;
    } catch (error) {
        logger.error({ err: error }, 'Error issuing verifiable credential:');
        throw new Error('Failed to issue verifiable credential');
    }
};

/**
 * Revokes a previously issued credential.
 */
export const revokeVerifiableCredential = async (credentialId: string) => {
    try {
        const updated = await VerifiableCredential.findByIdAndUpdate(
            credentialId,
            { status: 'revoked' },
            { new: true }
        );

        if (!updated) {
            throw new Error('Credential not found');
        }

        logger.info(`Revoked credential: ${credentialId}`);
        return updated;
    } catch (error) {
        logger.error({ err: error }, 'Error revoking verifiable credential:');
        throw new Error('Failed to revoke credential');
    }
};
