import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";
import { redisClient } from "../api/redis.js";

dotenv.config();

let _genAI: GoogleGenAI | null = null;
function getGenAI() {
  if (!_genAI) {
    const processEnv = (globalThis as any).process?.env || {};
    if (!processEnv.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not set. Embeddings will not be generated.");
      return null;
    }
    _genAI = new GoogleGenAI({
      apiKey: processEnv.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return _genAI;
}

const embeddingCache = new Map<string, number[]>();

async function getCachedEmbedding(text: string): Promise<number[] | null> {
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  if ((globalThis as any).REDIS_AVAILABLE && redisClient) {
    try {
      const cached = await redisClient.get(`embedding:${hash}`);
      if (cached) return JSON.parse(cached);
    } catch (err: any) {
      console.error("[EmbeddingCache] Redis read error:", err.message);
    }
  }
  return embeddingCache.get(hash) || null;
}

async function setCachedEmbedding(text: string, values: number[]) {
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  if ((globalThis as any).REDIS_AVAILABLE && redisClient) {
    try {
      await redisClient.set(`embedding:${hash}`, JSON.stringify(values), 'EX', 86400 * 30); // 30 days expiry
    } catch (err: any) {
      console.error("[EmbeddingCache] Redis write error:", err.message);
    }
  }
  embeddingCache.set(hash, values);
}

function validateEmbedding(values: any): number[] | null {
  if (!Array.isArray(values)) return null;
  if (values.length !== 768) {
    console.warn(`[EmbeddingService] Validation failed: expected 768 dimensions, got ${values.length}`);
    return null;
  }
  for (let i = 0; i < values.length; i++) {
    if (typeof values[i] !== 'number' || isNaN(values[i])) {
      console.warn(`[EmbeddingService] Validation failed: non-numeric element at index ${i}`);
      return null;
    }
  }
  return values as number[];
}

/**
 * Generates a vector embedding for an opportunity or search query using Gemini text-embedding-004.
 * Dimensions: 768
 */
export async function generateOpportunityEmbedding(text: string): Promise<number[] | null> {
  const cached = await getCachedEmbedding(text);
  if (cached) return cached;

  const ai = getGenAI();
  if (!ai) return null;

  try {
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: text,
    });
    
    if (response.embeddings && response.embeddings.length > 0) {
      const values = response.embeddings[0].values || null;
      const validated = values ? validateEmbedding(values) : null;
      if (validated) {
        await setCachedEmbedding(text, validated);
        return validated;
      }
    }
    return null;
  } catch (error: any) {
    console.error("[EmbeddingService] Error generating embedding:", error.message);
    return null;
  }
}

/**
 * Generates vector embeddings for multiple texts in a single batch API call.
 */
export async function generateOpportunityEmbeddings(texts: string[]): Promise<(number[] | null)[]> {
  const ai = getGenAI();
  if (!ai || !texts || texts.length === 0) return texts.map(() => null);

  const results: (number[] | null)[] = [];
  const missingIndices: number[] = [];
  const missingTexts: string[] = [];

  for (let i = 0; i < texts.length; i++) {
    const cached = await getCachedEmbedding(texts[i]);
    if (cached) {
      results[i] = cached;
    } else {
      results[i] = null;
      missingIndices.push(i);
      missingTexts.push(texts[i]);
    }
  }

  if (missingTexts.length === 0) {
    return results;
  }

  try {
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: missingTexts,
    });

    if (response.embeddings && response.embeddings.length > 0) {
      for (let j = 0; j < response.embeddings.length; j++) {
        const values = response.embeddings[j].values || null;
        const validated = values ? validateEmbedding(values) : null;
        const originalIndex = missingIndices[j];
        if (validated) {
          results[originalIndex] = validated;
          await setCachedEmbedding(missingTexts[j], validated);
        }
      }
    }
  } catch (err: any) {
    console.error("[EmbeddingService] Batch embedding failed, falling back to individual calls:", err.message);
    // Fallback to sequential calls for the missing texts
    for (let j = 0; j < missingTexts.length; j++) {
      const validated = await generateOpportunityEmbedding(missingTexts[j]);
      results[missingIndices[j]] = validated;
    }
  }

  return results;
}
