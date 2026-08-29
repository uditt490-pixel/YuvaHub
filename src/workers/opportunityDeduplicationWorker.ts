import { Worker, Job } from 'bullmq';
import { redisClient } from '../config/redis.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Opportunity } from '../models/Opportunity.js';
import { normalizeStipend } from '../utils/stipendNormalizer.js';
import { logger } from '../utils/logger.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Calculates cosine similarity between two vector embeddings.
 * @param vecA - First vector array.
 * @param vecB - Second vector array.
 * @returns Similarity score between 0 and 1.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
        throw new Error('Vector dimensions must match');
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Generates a vector embedding for the given text using Gemini.
 * @param text - The title and description of the opportunity.
 * @returns A number array representing the embedding.
 */
async function generateEmbedding(text: string): Promise<number[]> {
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-exp-03-07' });
    const result = await model.embedContent(text);
    return result.embedding.values;
}

/**
 * BullMQ Worker for processing opportunity deduplication and normalization.
 */
export const opportunityDeduplicationWorker = new Worker(
    'opportunity_deduplication',
    async (job: Job) => {
        const { opportunityData } = job.data;
        logger.info(`Starting deduplication for opportunity: ${opportunityData.title}`);

        try {
            // 1. Normalize Stipend Data
            const normalizedStipend = normalizeStipend(opportunityData.stipend || '');

            // 2. Generate Embedding for new opportunity
            const embeddingText = `${opportunityData.title} ${opportunityData.description}`;
            const newEmbedding = await generateEmbedding(embeddingText);

            // 3. Fetch recent opportunities for comparison (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const recentOpportunities = await Opportunity.find({
                createdAt: { $gte: thirtyDaysAgo },
                status: 'active',
            }).select('title description embedding canonicalId sourceLinks');

            let matchedCanonicalId = null;
            let highestSimilarity = 0;

            // 4. Compare embeddings
            for (const opp of recentOpportunities) {
                if (opp.embedding && opp.embedding.length === newEmbedding.length) {
                    const similarity = cosineSimilarity(newEmbedding, opp.embedding);
                    if (similarity > 0.90 && similarity > highestSimilarity) {
                        highestSimilarity = similarity;
                        matchedCanonicalId = opp.canonicalId || opp._id.toString();
                    }
                }
            }

            // 5. Merge or Create
            if (matchedCanonicalId) {
                logger.info(`Duplicate found with similarity ${highestSimilarity}. Merging into ${matchedCanonicalId}`);
                await Opportunity.findByIdAndUpdate(
                    matchedCanonicalId,
                    {
                        $addToSet: { sourceLinks: { source: opportunityData.source, url: opportunityData.url } },
                        $set: { normalizedStipend },
                    },
                    { new: true }
                );
                return { status: 'merged', canonicalId: matchedCanonicalId };
            } else {
                logger.info('No duplicate found. Creating new canonical opportunity.');
                const newOpportunity = new Opportunity({
                    ...opportunityData,
                    normalizedStipend,
                    embedding: newEmbedding,
                    canonicalId: new Map().toString(), // Will be replaced by actual _id
                    sourceLinks: [{ source: opportunityData.source, url: opportunityData.url }],
                });
                await newOpportunity.save();

                // Update canonicalId to its own _id
                newOpportunity.canonicalId = newOpportunity._id.toString();
                await newOpportunity.save();

                return { status: 'created', id: newOpportunity._id };
            }
        } catch (error) {
            logger.error({ error }, `Deduplication worker failed for job ${job.id}:`);
            throw error;
        }
    },
    { connection: redisClient as any }
);
