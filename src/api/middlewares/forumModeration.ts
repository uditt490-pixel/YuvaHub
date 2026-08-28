import { Request, Response, NextFunction } from "express";
import { getGenAI } from "../genai.js";
import { AppError } from "../../lib/AppError.js";

const FALLBACK_TOXIC_REGEX =
  /\b(badword|abuse|hate|spam|scam|idiot|stupid|bastard)\b/i;

function fallbackTags(text: string): string[] {
  const words = text.toLowerCase().match(/[a-z][a-z0-9+#.]{2,}/g) || [];
  const stop = new Set([
    "the", "and", "for", "are", "with", "that", "this", "from",
    "have", "was", "you", "your", "about", "into",
  ]);
  const freq: Record<string, number> = {};
  for (const w of words) {
    if (stop.has(w)) continue;
    freq[w] = (freq[w] || 0) + 1;
  }
  return Object.keys(freq)
    .sort((a, b) => freq[b] - freq[a])
    .slice(0, 5)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
}

/**
 * Express middleware: runs before a thread/comment is saved.
 * - Blocks the request (400) if the AI flags the text as toxic.
 * - Attaches `req.body.aiTags` with 3-5 auto-generated tags.
 */
export const moderateForumContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const title = typeof req.body.title === "string" ? req.body.title : "";
  const content = typeof req.body.content === "string" ? req.body.content : "";
  const combinedText = `${title} ${content}`.trim();

  if (!combinedText) return next();

  const ai = getGenAI();
  if (!ai) {
    if (FALLBACK_TOXIC_REGEX.test(combinedText)) {
      throw AppError.badRequest(
        "Post contains inappropriate language or prohibited keywords.",
        "TOXIC_CONTENT"
      );
    }
    req.body.aiTags = fallbackTags(combinedText);
    return next();
  }

  try {
    const prompt = `You are a content moderation assistant for a student community forum called YuvaHub.
Analyze the following user-submitted text and respond with ONLY a JSON object (no markdown, no extra text) in this shape:
{"toxic": boolean, "reason": string, "tags": string[]}
"toxic" is true only if the text contains harassment, hate speech, explicit content, spam, or severe abuse.
"tags" should be 3 to 5 short relevant topic tags generated from the text content.
Text:
"""${combinedText.slice(0, 3000)}"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const raw = response.text || "";
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const parsed = start !== -1 && end !== -1 ? JSON.parse(raw.slice(start, end + 1)) : null;

    if (parsed?.toxic) {
      throw AppError.badRequest(
        parsed.reason || "Post flagged as inappropriate by AI moderation.",
        "TOXIC_CONTENT"
      );
    }

    req.body.aiTags =
      Array.isArray(parsed?.tags) && parsed.tags.length > 0
        ? parsed.tags.slice(0, 5)
        : fallbackTags(combinedText);

    return next();
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error("[ForumModeration] AI moderation failed, using fallback:", err);
    if (FALLBACK_TOXIC_REGEX.test(combinedText)) {
      throw AppError.badRequest(
        "Post contains inappropriate language or prohibited keywords.",
        "TOXIC_CONTENT"
      );
    }
    req.body.aiTags = fallbackTags(combinedText);
    return next();
  }
};