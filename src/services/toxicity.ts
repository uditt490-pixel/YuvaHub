import { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import { createBreaker } from './circuitBreaker';

// Simple local keyword-based check for quick offline toxicity classification
const TOXIC_KEYWORDS = [
  'bastard', 'bitch', 'asshole', 'fuck', 'shit', 'cunt', 'dick', 'cock', 'pussy',
  'motherfucker', 'retard', 'faggot', 'nigger', 'idiot', 'moron', 'kill yourself',
  'die', 'hate you'
];

const geminiBreaker = createBreaker(
  async (genAI: GoogleGenAI, text: string) => {
    return await genAI.models.generateContent({
      model: "gemini-2.5-flash", // Using a fast, standard model
      contents: `Classify if the following text is toxic, abusive, hateful, or highly inappropriate. Respond with ONLY 'toxic' or 'clean' (in lowercase): \n\n"${text}"`
    });
  },
  { timeout: 5000, errorThresholdPercentage: 50, resetTimeout: 30000 },
  'Gemini AI'
);

geminiBreaker.fallback((genAI, text, err) => {
  // If Gemini fails or circuit is open, we fallback to 'clean' to not block users unnecessarily
  return { text: 'clean' };
});

/**
 * Checks if a string contains toxic content.
 * First uses a fast keyword list check. If configured, falls back to Google Gemini.
 */
export async function isToxic(text: string, genAI?: GoogleGenAI | null): Promise<boolean> {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const cleanText = text.toLowerCase().trim();

  // 1. Fast local regex / keyword check
  for (const word of TOXIC_KEYWORDS) {
    if (cleanText.includes(word)) {
      console.log(`[Toxicity Checker] Blocked by local keyword check matching word: "${word}"`);
      return true;
    }
  }

  // 2. Google Gemini fallback if instance is available
  if (genAI) {
    try {
      const response = await geminiBreaker.fire(genAI, text);
      const responseText = ((response as any).text || '').toLowerCase().trim();
      console.log(`[Toxicity Checker] Gemini model response: "${responseText}"`);
      return responseText.includes('toxic');
    } catch (err: any) {
      console.warn('[Toxicity Checker] Gemini check failed, falling back to local clean:', err.message);
    }
  }

  return false;
}

/**
 * Express middleware for checking toxicity.
 * Scans req.body.content or req.body.text.
 */
export function createToxicityMiddleware(getGenAI: () => GoogleGenAI | null) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const content = req.body.content || req.body.text;
    if (!content) {
      return next();
    }

    const genAI = getGenAI();
    const toxic = await isToxic(content, genAI);

    if (toxic) {
      return res.status(400).json({
        error: "Your content has been flagged as toxic and cannot be saved."
      });
    }

    next();
  };
}
