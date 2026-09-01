import { GoogleGenAI } from '@google/genai';

// Initialize Gemini (Ensure GEMINI_API_KEY is in your .env)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const moderateAndTag = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const textToAnalyze = `Title: ${title}\nContent: ${content}`;

    const prompt = `Analyze the following forum post for a student tech community.
    1. Check if it contains toxic, offensive, spam, or highly inappropriate content.
    2. Generate 3-5 highly relevant technology or career tags (comma-separated, lowercase).
    Respond STRICTLY in this JSON format: {"isToxic": true/false, "tags": ["tag1", "tag2"]}
    
    Post to analyze:
    ${textToAnalyze}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // Clean and parse the AI response
    const jsonString = response.text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(jsonString);

    if (result.isToxic) {
      return res.status(403).json({ 
        error: "Content flagged by AI moderation. Please keep discussions professional and safe." 
      });
    }

    // Attach the AI-generated tags to the request body so the controller can save them
    req.body.tags = result.tags;
    next();

  } catch (error) {
    console.error("AI Moderation Error:", error);
    // If the AI fails, we allow the post to go through but with an empty tag array to prevent blocking users
    req.body.tags = [];
    next();
  }
};
