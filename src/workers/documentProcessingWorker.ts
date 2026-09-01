import { Worker, Job } from 'bullmq';
import { redisClient } from '../config/redis';
import { SecureDocument } from '../models/SecureDocument';
import { applyRegexRedaction, applyAIRedaction } from '../services/piiRedactionService';
import { logger } from '../utils/logger';

/**
 * BullMQ Worker for asynchronous PII redaction of uploaded documents.
 */
export const documentProcessingWorker = new Worker(
    'document_processing',
    async (job: Job) => {
        const { documentId } = job.data;
        logger.info(`Starting document processing for ID: ${documentId}`);

        try {
            const doc = await SecureDocument.findById(documentId);
            if (!doc) {
                throw new Error('Document not found');
            }

            doc.status = 'processing';
            await doc.save();

            // Mock text extraction from PDF/Image (in production, use pdf-parse or Tesseract.js)
            const mockExtractedText = `John Doe, 123 Main St, Springfield. Email: john.doe@example.com, Phone: 555-123-4567. SSN: 123-45-6789.`;

            // Step 1: Regex Redaction (Fast, deterministic)
            const regexResult = applyRegexRedaction(mockExtractedText);

            // Step 2: AI Redaction (Contextual)
            const aiResult = await applyAIRedaction(regexResult.redactedText);

            // Combine logs
            const combinedLog = [...regexResult.log, ...aiResult.log];

            // Mock saving the redacted version to cloud storage
            const mockRedactedUrl = `https://storage.yuvahub.com/redacted/${documentId}.pdf`;

            doc.redactedStorageUrl = mockRedactedUrl;
            doc.redactionLog = combinedLog;
            doc.status = 'completed';
            await doc.save();

            logger.info(`Document ${documentId} processed successfully.`);
            return { status: 'completed', documentId };
        } catch (error) {
            logger.error({ err: error }, `Document processing failed for ID ${documentId}:`);
            await SecureDocument.findByIdAndUpdate(documentId, { status: 'failed' });
            throw error;
        }
    },
    { connection: redisClient }
);
