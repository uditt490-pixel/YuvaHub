import { Worker, Job } from 'bullmq';
import { redisClient } from '../config/redis.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Opportunity } from '../models/Opportunity.js';
import { normalizeStipend } from '../utils/stipendNormalizer.js';
import { logger } from '../utils/logger.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const opportunityDeduplicationWorker = new Worker(
    'opportunity_deduplication',
    async (job: Job) => {
        const { opportunityData } = job.data;
        const SIMILARITY_THRESHOLD = 0.85;

        try {
            const normalizedStipend = normalizeStipend(opportunityData.stipend);

            const embeddingText = `${opportunityData.title} ${opportunityData.company} ${opportunityData.description}`;
            const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
            const result = await model.embedContent(embeddingText);
            const newEmbedding = result.embedding.values;

            const candidateOpportunities = await Opportunity.find({
                category: opportunityData.category,
                isDuplicate: false,
            });

            let matchFound = false;
            let matchedCanonicalId = null;

            for (const candidate of candidateOpportunities) {
                if (candidate.embedding && candidate.embedding.length > 0) {
                    const similarity = cosineSimilarity(newEmbedding, candidate.embedding);
                    if (similarity >= SIMILARITY_THRESHOLD) {
                        matchFound = true;
                        matchedCanonicalId = candidate.canonicalId || candidate._id.toString();
                        break;
                    }
                }
            }

            if (matchFound && matchedCanonicalId) {
                const duplicateRecord = new Opportunity({
                    ...opportunityData,
                    normalizedStipend,
                    embedding: newEmbedding,
                    isDuplicate: true,
                    canonicalId: matchedCanonicalId,
                });
                await duplicateRecord.save();

                await Opportunity.findByIdAndUpdate(matchedCanonicalId, {
                    $addToSet: {
                        sourceLinks: { source: opportunityData.source, url: opportunityData.url },
                    },
                });

                return { status: 'duplicate_linked', canonicalId: matchedCanonicalId };
            } else {
                const newOpportunity = new Opportunity({
                    ...opportunityData,
                    normalizedStipend,
                    isDuplicate: false,
                    embedding: newEmbedding,
                    canonicalId: new Map().toString(),
                    sourceLinks: [{ source: opportunityData.source, url: opportunityData.url }],
                });
                await newOpportunity.save();

                newOpportunity.canonicalId = newOpportunity._id.toString();
                await newOpportunity.save();

                return { status: 'created', id: newOpportunity._id };
            }
        } catch (error) {
            logger.error(error as any, `Deduplication worker failed for job ${job.id}:`);
            throw error;
        }
    },
    { connection: redisClient as any }
);
