import crypto from 'crypto';
import { logger } from '../utils/logger';

/**
 * Encryption algorithm and key derivation settings.
 * Using AES-256-GCM for authenticated encryption.
 */
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits for GCM

/**
 * Derives a symmetric key from a base secret (e.g., a shared secret or user-specific key).
 * In a true E2EE system, this would be derived from a Diffie-Hellman key exchange.
 * For this implementation, we use a server-side secret combined with the conversation ID.
 * 
 * @param conversationId - The unique identifier for the chat.
 * @returns A Buffer containing the derived symmetric key.
 */
export const deriveConversationKey = (conversationId: string): Buffer => {
    const baseSecret = process.env.ENCRYPTION_SECRET || 'default-fallback-secret-change-in-production';

    // Use HKDF-like derivation using SHA-256
    const hash = crypto.createHash('sha256');
    hash.update(baseSecret);
    hash.update(conversationId);

    return hash.digest().slice(0, KEY_LENGTH);
};

/**
 * Encrypts plain text content using AES-256-GCM.
 * 
 * @param text - The plain text message to encrypt.
 * @param conversationId - The conversation identifier to derive the key.
 * @returns An object containing the encrypted content (hex) and the IV (hex).
 */
export const encryptMessage = (text: string, conversationId: string): { encryptedContent: string; iv: string } => {
    try {
        const key = deriveConversationKey(conversationId);
        const iv = crypto.randomBytes(IV_LENGTH);

        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Append auth tag for GCM
        const authTag = cipher.getAuthTag();
        const finalEncrypted = `${encrypted}:${authTag.toString('hex')}`;

        return {
            encryptedContent: finalEncrypted,
            iv: iv.toString('hex'),
        };
    } catch (error) {
        logger.error('Encryption failed:', error);
        throw new Error('Failed to encrypt message');
    }
};

/**
 * Decrypts encrypted content using AES-256-GCM.
 * 
 * @param encryptedContent - The hex-encoded encrypted string (including auth tag).
 * @param ivHex - The hex-encoded initialization vector.
 * @param conversationId - The conversation identifier to derive the key.
 * @returns The decrypted plain text string.
 */
export const decryptMessage = (encryptedContent: string, ivHex: string, conversationId: string): string => {
    try {
        const key = deriveConversationKey(conversationId);
        const iv = Buffer.from(ivHex, 'hex');

        // Split encrypted content and auth tag
        const parts = encryptedContent.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid encrypted content format');
        }

        const encryptedText = parts[0];
        const authTag = Buffer.from(parts[1], 'hex');

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        logger.error('Decryption failed:', error);
        throw new Error('Failed to decrypt message');
    }
};
