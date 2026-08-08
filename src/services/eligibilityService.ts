import { getCommandDB } from "../lib/mongodb";
import { getGenAI } from "../../server";
import { EligibilityPrediction } from "../models/eligibilitySchema";

export async function predictEligibility(
  userId: string,
  opportunityId: string,
  profile: any,
  opportunity: any
): Promise<EligibilityPrediction> {
  const ai = getGenAI();

  if (!ai) {
    throw new Error("AI service unavailable");
  }

  const prompt = `
You are an expert career eligibility evaluator.

Compare the student's profile against the opportunity requirements.

STUDENT PROFILE:
${JSON.stringify(profile, null, 2)}

OPPORTUNITY:
${JSON.stringify(opportunity, null, 2)}

Evaluate these criteria:
1. Skills
2. Education
3. Experience
4. Projects
5. Certifications

Calculate a Success Score from 0 to 100.

For every criterion provide:
- score from 0 to 100
- matched items
- missing items

Also provide:
- reasons for the score
- personalized recommendations

Return ONLY valid JSON in this format:

{
  "successScore": 0,
  "breakdown": {
    "skills": {
      "score": 0,
      "matched": [],
      "missing": []
    },
    "education": {
      "score": 0,
      "matched": [],
      "missing": []
    },
    "experience": {
      "score": 0,
      "matched": [],
      "missing": []
    },
    "projects": {
      "score": 0,
      "matched": [],
      "missing": []
    },
    "certifications": {
      "score": 0,
      "matched": [],
      "missing": []
    }
  },
  "reasons": [],
  "recommendations": []
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ text: prompt }],
    config: {
      responseMimeType: "application/json",
    },
  });

  const parsed = JSON.parse(response.text || "{}");

  const now = new Date();

  const prediction: EligibilityPrediction = {
    userId,
    opportunityId,
    successScore: Math.max(
      0,
      Math.min(100, Number(parsed.successScore) || 0)
    ),
    breakdown: parsed.breakdown,
    reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations
      : [],
    createdAt: now,
    updatedAt: now,
  };

  const db = await getCommandDB();

  await db.collection("eligibility_predictions").insertOne(prediction);

  return prediction;
}