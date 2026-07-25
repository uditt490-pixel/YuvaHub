import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let _genAI: GoogleGenAI | null = null;
function getGenAI() {
  if (!_genAI) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not set. Embeddings will not be generated.");
      return null;
    }
    _genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return _genAI;
}

/**
 * Generates a vector embedding for an opportunity or search query using Gemini text-embedding-004.
 * Dimensions: 768
 */
export async function generateOpportunityEmbedding(text: string): Promise<number[] | null> {
  const ai = getGenAI();
  if (!ai) return null;

  try {
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: text,
    });
    
    if (response.embeddings && response.embeddings.length > 0) {
      return response.embeddings[0].values || null;
    }
    return null;
  } catch (error) {
    console.error("[EmbeddingService] Error generating embedding:", error);
    return null;
  }
}
