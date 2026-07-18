import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function listModels() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  try {
    const response = await ai.models.list();
    for await (const model of response) {
      console.log(`- ${model.name} (Methods: ${model.supportedGenerationMethods?.join(', ')})`);
    }
  } catch (err: any) {
    console.error("Error listing models:", err.message);
  }
}

listModels();
