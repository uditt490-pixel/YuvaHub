import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
async function test() {
    try {
        const response = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "Hi"
        });
        console.log(response.text);
    } catch(e) {
        console.error("error", e);
    }
}
test();
