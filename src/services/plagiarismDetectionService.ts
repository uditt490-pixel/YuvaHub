import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generates a text embedding using Gemini for similarity comparison.
 * 
 * @param text - The text content to embed.
 * @returns A number array representing the vector embedding.
 */
export const generateTextEmbedding = async (text: string): Promise<number[]> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-embedding-exp-03-07' });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        logger.error({ error }, 'Error generating text embedding:');
        throw new Error('Failed to generate embedding');
    }
};

/**
 * Calculates the cosine similarity between two vector embeddings.
 * 
 * @param vecA - First vector.
 * @param vecB - Second vector.
 * @returns Similarity score between 0 and 1.
 */
export const calculateCosineSimilarity = (vecA: number[], vecB: number[]): number => {
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
};

/**
 * Analyzes new content against a database of recent content to detect plagiarism.
 * 
 * @param newText - The new content to check.
 * @param recentContents - Array of recent content objects with { id, text, embedding }.
 * @param threshold - Similarity threshold (0-1) to flag as potential plagiarism.
 * @returns The highest similarity score and the matched source.
 */
export const detectPlagiarism = async (
    newText: string,
    recentContents: { id: string; text: string; embedding: number[] }[],
    threshold: number = 0.85
) => {
    try {
        const newEmbedding = await generateTextEmbedding(newText);
        let highestScore = 0;
        let matchedSource: { id: string; text: string } | null = null;

        for (const content of recentContents) {
            const similarity = calculateCosineSimilarity(newEmbedding, content.embedding);
            if (similarity > highestScore) {
                highestScore = similarity;
                matchedSource = { id: content.id, text: content.text };
            }
        }

        return {
            similarityScore: highestScore * 100, // Convert to percentage
            isPlagiarized: highestScore >= threshold,
            matchedSource,
        };
    } catch (error) {
        logger.error({ error }, 'Plagiarism detection failed:');
        throw new Error('Failed to analyze content for plagiarism');
    }
};
