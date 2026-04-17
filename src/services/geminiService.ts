import { GoogleGenAI } from "@google/genai";
import { Event, UserProfile, TopicDeepDive } from "../types";
import { FALLBACK_EVENTS } from "../constants";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. Using fallback mode.");
      return null;
    }
    if (!aiClient) {
      aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
  } catch (err) {
    console.error("Failed to initialize AI client:", err);
    return null;
  }
}

export async function fetchEventsAndSchemes(query: string = "", profile?: UserProfile): Promise<Event[]> {
  try {
    const ai = getAiClient();
    
    // If no AI client (missing key or init error), return fallback immediately
    if (!ai) {
      console.info("API Key not available. Serving high-quality fallback data.");
      return FALLBACK_EVENTS;
    }

    const profileContext = profile ? `
      User Profile:
      - Location: ${profile.location}
      - Age: ${profile.age}
      - Interests: ${profile.interests.join(", ")}
    ` : "";

    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const prompt = `Current Date: ${currentDate}. 
      Find 8-10 ACTIVE corporate hackathons, government schemes, or programs. 
      ${query ? `PRIORITY FOCUS: Search specifically for "${query}". If "${query}" refers to a specific known program (like PM-KUSUM, PM-JAY, Google Hash Code, etc.), ensure it is the first item if found.` : ''}
      ONLY include events with deadlines AFTER ${currentDate}.
      ${profileContext}
      Format as JSON array:
      {
        "id": "string",
        "title": "string",
        "organization": "string",
        "type": "hackathon" | "scheme" | "program",
        "description": "string",
        "location": "string",
        "date": "string",
        "link": "string",
        "price": "string",
        "coordinates": { "lat": number, "lng": number }
      }
      Search Query or Keywords: ${query}`;

    let response;
    try {
      // First attempt with Google Search tool - increased to 30s for reliability
      const searchPromise = ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
        },
      });

      // Race against a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Search timeout")), 30000)
      );

      response = await Promise.race([searchPromise, timeoutPromise]) as any;
    } catch (searchError: any) {
      console.info("Gemini search tool timed out, using internal knowledge fallback:", searchError.message);
      // Fallback attempt without tools - much faster
      response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt + "\n\nNote: Use your internal knowledge to provide the most recent and accurate information possible.",
        config: {
          responseMimeType: "application/json",
        },
      });
    }

    const text = response.text;
    if (!text) {
      console.warn("Gemini returned empty response text.");
      return [];
    }
    
    // Handle potential markdown code blocks
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : text;
    
    return JSON.parse(jsonString);
  } catch (error: any) {
    console.error("Detailed Gemini Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    // Return high-quality fallback events if API fails
    return FALLBACK_EVENTS;
  }
}

export async function getSearchSuggestions(partialQuery: string): Promise<string[]> {
  if (!partialQuery || partialQuery.length < 2) return [];
  
  try {
    const ai = getAiClient();
    if (!ai) return [];

    const prompt = `Based on the partial search query: "${partialQuery}", suggest 4-5 highly relevant search terms related to corporate hackathons, government student schemes (like scholarship, PMKVY, etc.), internships, and educational programs in India. 
    Return as a simple JSON array of strings. 
    Examples: if "hack" -> ["Hackathons in India", "Frontend Hackathon", "Corporate Coding Challenges", "ML Hackathons"]
    Example: if "scheme" -> ["Govt Scholarship Schemes", "Skill Development Schemes", "State Education Loans", "Startup India Scheme"]`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : text;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Suggestion error:", error);
    return [];
  }
}

export async function getTopicDeepDive(topic: string): Promise<TopicDeepDive | null> {
  if (!topic || topic.length < 3) return null;
  
  try {
    const ai = getAiClient();
    if (!ai) return null;

    const prompt = `Analyze the industry/topic: "${topic}" in the context of opportunities for students and early-career professionals in India.
    
    Provide a concise but comprehensive "Deep Dive" structure in JSON:
    {
      "topic": "${topic}",
      "summary": "A 2-3 sentence overview of this field in India right now.",
      "keySkills": ["Skill 1", "Skill 2", "Skill 3"],
      "trendingOpportunities": [
        { "title": "Opportunity Name/Type", "desc": "Brief 1-sentence why it's trending" }
      ],
      "marketOutlook": "A brief outlook on career/research growth (max 150 chars).",
      "relatedTags": ["Tag 1", "Tag 2"]
    }
    
    Make it feel professional, insightful, and forward-looking. Avoid generic advice; focus on current Indian ecosystem relevance (e.g., Digital India, AI Missions, Industry hubs).`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return null;
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : text;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Deep dive error:", error);
    return null;
  }
}
