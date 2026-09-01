import crypto from 'crypto';

/**
 * Generates a mock cryptographic proof for a Verifiable Credential.
 * In a production environment, this should use a real DID library 
 * (e.g., did:key, ethr-did) and a secure signing mechanism.
 */
export const generateMockProof = (credentialData: any) => {
    const now = new Date().toISOString();
    const verificationMethod = 'did:web:yuvahub.com#key-1';

    // Create a deterministic string to sign
    const dataToSign = JSON.stringify({
        ...credentialData,
        proofPurpose: 'assertionMethod',
        verificationMethod,
    });

    // Mock signing using SHA-256 (Replace with actual Ed25519/ECDSA signing in production)
    const proofValue = `z${crypto.createHash('sha256').update(dataToSign + process.env.JWT_SECRET).digest('hex')}`;

    return {
        type: 'Ed25519Signature2020',
        created: now,
        verificationMethod,
        proofPurpose: 'assertionMethod',
        proofValue,
    };
};

/**
 * Formats a badge into a W3C Verifiable Credential JSON-LD structure.
 */
export const formatAsJSONLD = (badgeName: string, userId: string, metadata: any) => {
    return {
        '@context': [
            'https://www.w3.org/2018/credentials/v1',
            'https://yuvahub.com/contexts/badges/v1',
        ],
        type: ['VerifiableCredential', 'SkillBadgeCredential'],
        issuer: 'did:web:yuvahub.com',
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
            id: `did:web:yuvahub.com:user:${userId}`,
            badgeName,
            ...metadata,
        },
    };
};
