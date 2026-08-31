import { Worker, Job } from 'bullmq';
import { redisClient } from '../config/redis';
import { ContentSimilarityReport } from '../models/ContentSimilarityReport';
import { detectPlagiarism } from '../services/plagiarismDetectionService';
import { logger } from '../utils/logger';

// Mock database fetch for recent content
const getRecentContents = async (contentType: string) => {
    // In production, fetch from MongoDB or a Vector Database like Pinecone/Meilisearch
    return [
        {
            id: 'mock-source-id-123',
            text: 'This is a sample post about web development and React hooks.',
            embedding: [], // Would be pre-computed
        }
    ];
};

/**
 * BullMQ Worker for processing content similarity checks.
 */
export const contentCheckWorker = new Worker(
    'content_plagiarism_check',
    async (job: Job) => {
        const { postId, contentType, text } = job.data;
        logger.info(`Starting plagiarism check for ${contentType}: ${postId}`);

        try {
            const recentContents = await getRecentContents(contentType);

            // For demonstration, we'll mock the embedding comparison result
            // In production, pass real embeddings to detectPlagiarism
            const mockSimilarityScore = Math.random() * 100;
            const isPlagiarized = mockSimilarityScore > 85;

            if (isPlagiarized) {
                const report = await ContentSimilarityReport.create({
                    postId,
                    contentType,
                    similarityScore: mockSimilarityScore,
                    matchedSourceId: recentContents[0]?.id || null,
                    matchedSourceText: recentContents[0]?.text || 'Unknown source',
                    status: 'pending',
                });

                logger.warn(`Plagiarism detected for ${postId}. Score: ${mockSimilarityScore.toFixed(2)}%. Report ID: ${report._id}`);

                // TODO: Trigger notification to moderators
                return { status: 'flagged', reportId: report._id };
            }

            logger.info(`Content ${postId} passed plagiarism check.`);
            return { status: 'cleared' };
        } catch (error) {
            logger.error(`Content check failed for ${postId}:`, error);
            throw error;
        }
    },
    { connection: redisClient }
);
