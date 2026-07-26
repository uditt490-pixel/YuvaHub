import { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import { createBreaker } from './circuitBreaker';
import { redisClient } from '../api/redis.js';
import crypto from 'crypto';

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

const toxicityCache = new Map<string, boolean>();

function normalizeModerationText(text: string): string {
  if (!text) return "";
  
  // 1. Normalize Unicode decomposed characters
  let normalized = text.normalize("NFKD");
  
  // 2. Remove standard diacritics / accents
  normalized = normalized.replace(/[\u0300-\u036f]/g, "");

  // 3. Map common leetspeak / homoglyphs to standard characters
  const homoglyphs: Record<string, string> = {
    '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '$': 's', '@': 'a',
    '!': 'i', '#': 'h', '*': 'o', '+': 't', 'v': 'u', 'x': 'x', 'z': 's',
  };
  
  let mapped = "";
  for (const char of normalized.toLowerCase()) {
    mapped += homoglyphs[char] || char;
  }

  // 4. Remove all non-alphanumeric characters to strip spacing / separator tricks
  const strippedOfSpacing = mapped.replace(/[^a-z0-9]/g, "");
  
  // Collapsed version for multi-word phrases
  const collapsedSpaces = mapped.replace(/\s+/g, " ").trim();
  
  return `${strippedOfSpacing} | ${collapsedSpaces}`;
}

async function getCachedToxicity(text: string): Promise<boolean | null> {
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  
  if ((globalThis as any).REDIS_AVAILABLE && redisClient) {
    try {
      const val = await redisClient.get(`toxicity_check:${hash}`);
      if (val !== null) return val === 'true';
    } catch (err: any) {
      console.error("[ToxicityCache] Redis get error:", err.message);
    }
  }
  
  if (toxicityCache.has(hash)) {
    return toxicityCache.get(hash)!;
  }
  return null;
}

async function setCachedToxicity(text: string, result: boolean) {
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  
  if ((globalThis as any).REDIS_AVAILABLE && redisClient) {
    try {
      await redisClient.set(`toxicity_check:${hash}`, String(result), 'EX', 86400); // 24 hour TTL
    } catch (err: any) {
      console.error("[ToxicityCache] Redis set error:", err.message);
    }
  }
  toxicityCache.set(hash, result);
}

async function checkToxicityInternal(text: string, genAI?: GoogleGenAI | null): Promise<boolean> {
  const norm = normalizeModerationText(text);
  const parts = norm.split(" | ");
  const stripped = parts[0];
  const collapsed = parts[1] || "";

  // 1. Fast local regex / keyword check on normalized forms
  for (const word of TOXIC_KEYWORDS) {
    const cleanWord = word.toLowerCase().trim();
    const isMultiWord = cleanWord.includes(" ");

    if (isMultiWord) {
      if (collapsed.includes(cleanWord)) {
        console.log(`[Toxicity Checker] Blocked by local keyword check (multi-word): "${word}"`);
        return true;
      }
    } else {
      if (stripped.includes(cleanWord) || collapsed.includes(cleanWord)) {
        console.log(`[Toxicity Checker] Blocked by local keyword check: "${word}"`);
        return true;
      }
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
 * Checks if a string contains toxic content.
 * First uses a fast keyword list check. If configured, falls back to Google Gemini.
 */
export async function isToxic(text: string, genAI?: GoogleGenAI | null): Promise<boolean> {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const cached = await getCachedToxicity(text);
  if (cached !== null) {
    console.log(`[Toxicity Checker] Returning cached result: ${cached}`);
    return cached;
  }

  const result = await checkToxicityInternal(text, genAI);
  await setCachedToxicity(text, result);
  return result;
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

