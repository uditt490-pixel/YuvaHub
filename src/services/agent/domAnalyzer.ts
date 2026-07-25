import { GoogleGenAI } from "@google/genai";

export interface FieldMapping {
  selector: string;
  fieldType: "text" | "file" | "checkbox" | "radio" | "select";
  valueToFill: string;
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function analyzeDomWithGemini(domHtml: string, userProfile: any): Promise<FieldMapping[]> {
  const prompt = `
You are an AI agent analyzing the DOM of a job application form.
Your goal is to map the user's profile data to the input fields found in the DOM.

User Profile:
${JSON.stringify(userProfile, null, 2)}

DOM HTML snippet (inputs only):
${domHtml}

Return a JSON array of objects with the following structure. ONLY return the raw JSON array, with no markdown formatting or backticks.
[
  {
    "selector": "CSS selector for the input field",
    "fieldType": "text" | "file" | "checkbox" | "radio" | "select",
    "valueToFill": "The value from the user profile that should be entered in this field"
  }
]
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const responseText = response.text;
    if (!responseText) return [];
    
    // Strip possible markdown backticks
    const cleanedText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const mappings: FieldMapping[] = JSON.parse(cleanedText);
    return mappings;
  } catch (error) {
    console.error("Error analyzing DOM with Gemini:", error);
    return [];
  }
}
