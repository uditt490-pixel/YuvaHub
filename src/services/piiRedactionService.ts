import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Strict regex patterns for immediate, deterministic PII masking.
 */
const PII_REGEX = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    phone: /(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
};

/**
 * Applies deterministic regex redaction to text.
 */
export const applyRegexRedaction = (text: string): { redactedText: string; log: any[] } => {
    let redactedText = text;
    const log = [];

    for (const [key, regex] of Object.entries(PII_REGEX)) {
        const matches = redactedText.match(regex);
        if (matches) {
            log.push({ field: key, originalLength: matches.join('').length, redacted: true });
            redactedText = redactedText.replace(regex, (match) => '*'.repeat(match.length));
        }
    }

    return { redactedText, log };
};

/**
 * Uses Gemini AI to detect and redact contextual PII (e.g., physical addresses, names in specific contexts).
 */
export const applyAIRedaction = async (text: string): Promise<{ redactedText: string; log: any[] }> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
      Analyze the following text and redact any Personally Identifiable Information (PII) such as physical addresses, full names, or sensitive identifiers. 
      Replace the PII with '[REDACTED]'. 
      Return ONLY the redacted text. Do not include explanations or markdown.
      
      Text: ${text.substring(0, 3000)} // Truncated for token limits
    `;

        const result = await model.generateContent(prompt);
        const redactedText = result.response.text().trim();

        // Mock log for AI redaction (in production, prompt AI to return structured JSON with log)
        const log = [{ field: 'contextual_pii', originalLength: text.length - redactedText.length, redacted: true }];

        return { redactedText, log };
    } catch (error) {
        logger.error({ err: error }, 'AI Redaction failed:');
        throw new Error('Failed to process document with AI');
    }
};
