import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { Event, UserProfile, RelatedDomains } from "../types";
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

/**
 * Robustly parses a string that might contain JSON wrapped in conversational text
 */
function safeJsonParse<T>(text: string, defaultValue: T): T {
  try {
    // 1. Try direct parse first
    return JSON.parse(text.trim());
  } catch (e) {
    try {
      // 2. Try to find the first '{' or '[' and the last '}' or ']'
      const firstCurly = text.indexOf('{');
      const firstSquare = text.indexOf('[');
      
      let start = -1;
      let end = -1;
      
      if (firstCurly !== -1 && (firstSquare === -1 || firstCurly < firstSquare)) {
        start = firstCurly;
        end = text.lastIndexOf('}') + 1;
      } else if (firstSquare !== -1) {
        start = firstSquare;
        end = text.lastIndexOf(']') + 1;
      }
      
      if (start !== -1 && end !== -1) {
        const potentialJson = text.substring(start, end);
        return JSON.parse(potentialJson);
      }
    } catch (innerError) {
      console.warn("Deeper JSON extraction failed:", innerError);
    }
    console.error("Failed to parse AI response as JSON:", text.substring(0, 100) + "...");
    return defaultValue;
  }
}

export async function fetchEventsAndSchemes(query: string = "", profile?: UserProfile): Promise<Event[]> {
  try {
    const ai = getAiClient();
    
    // If no AI client (missing key or init error), return fallback with basic local search
    if (!ai) {
      console.info("API Key not available. Serving filtered fallback data.");
      if (query) {
        const q = query.toLowerCase();
        return FALLBACK_EVENTS.filter(e => 
          e.title.toLowerCase().includes(q) || 
          e.organization.toLowerCase().includes(q) || 
          e.description.toLowerCase().includes(q) ||
          e.industry?.toLowerCase().includes(q)
        );
      }
      return FALLBACK_EVENTS;
    }

    const profileContext = profile ? `
      User Profile:
      - Location: ${profile.location}
      - Age: ${profile.age}
      - Interests: ${profile.interests?.join(", ") || "None"}
      - Skills: ${profile.skills?.join(", ") || "None"}
    ` : "";

    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const prompt = `Task: Fetch 8-10 REAL and ACTIVE corporate hackathons, government student schemes, scholarships, or internship programs.
      Current Date: ${currentDate}.
      ${query ? `Search Query: "${query}". You MUST prioritize results matching this query. If "${query}" is a specific program, find its latest details.` : 'Provide a diverse mix of popular student opportunities in India.'}
      Deadline constraint: ONLY include events with deadlines after ${currentDate}.
      Context: ${profileContext || "Indian students/graduates."}
      
      STRICT REQUIREMENT: Return a VALID JSON array of objects. NO conversational text. NO markdown code blocks. NO explanation.`;

    const schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique slug" },
          title: { type: Type.STRING },
          organization: { type: Type.STRING },
          type: { type: Type.STRING, description: "Must be one of: hackathon, scheme, program" },
          description: { type: Type.STRING },
          location: { type: Type.STRING, description: "e.g. Online, Pan India, or City" },
          date: { type: Type.STRING, description: "Deadline or Event date" },
          link: { type: Type.STRING },
          applyLink: { type: Type.STRING },
          price: { type: Type.STRING, description: "Free or Amount" },
          isPaid: { type: Type.BOOLEAN, description: "True if user gets paid (stipend/prize)" },
          industry: { type: Type.STRING, description: "e.g. AI, Govt, E-commerce, Finance" },
          eligibility: { type: Type.STRING, description: "Short summary of who can apply" },
          coordinates: {
            type: Type.OBJECT,
            properties: {
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER }
            },
            required: ["lat", "lng"]
          }
        },
        required: ["id", "title", "organization", "type", "description", "location", "date", "link", "applyLink", "isPaid", "industry", "eligibility", "coordinates"]
      }
    };

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          toolConfig: { includeServerSideToolInvocations: true },
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });
    } catch (error: any) {
      console.error("Primary AI Search failed:", error);
      if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        if (query) {
          const q = query.toLowerCase();
          return FALLBACK_EVENTS.filter(e => 
            e.title.toLowerCase().includes(q) || 
            e.organization.toLowerCase().includes(q) || 
            e.description.toLowerCase().includes(q)
          );
        }
        return FALLBACK_EVENTS;
      }
      // Fallback attempt without tools - optimized for speed
      response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt + "\n\nNote: Use internal knowledge. Speed is priority. JSON ONLY.",
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });
    }

    return safeJsonParse(response.text, FALLBACK_EVENTS);
  } catch (error: any) {
    console.error("Detailed Gemini Error:", error);
    return FALLBACK_EVENTS;
  }
}

export async function getSearchSuggestions(partialQuery: string): Promise<string[]> {
  if (!partialQuery || partialQuery.length < 2) return [];
  
  try {
    const ai = getAiClient();
    if (!ai) return [];

    const prompt = `Based on the partial search query: "${partialQuery}", suggest 4-5 highly relevant search terms related to corporate hackathons, government student schemes, internships, and educational programs in India.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
    });

    return safeJsonParse(response.text, []);
  } catch (error: any) {
    return [];
  }
}

export async function getRelatedDomains(topic: string): Promise<RelatedDomains | null> {
  if (!topic || topic.length < 3) return null;
  
  try {
    const ai = getAiClient();
    if (!ai) return null;

    const prompt = `Analyze the search query: "${topic}". Identify 3-4 highly specific and relevant sub-domains or specialized career paths within this topic for students in India.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        topic: { type: Type.STRING },
        domains: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              relevance: { type: Type.STRING },
              marketTrend: { type: Type.STRING }
            },
            required: ["title", "description", "relevance", "marketTrend"]
          }
        }
      },
      required: ["topic", "domains"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      },
    });

    return safeJsonParse(response.text, null);
  } catch (error) {
    console.error("Related domains error:", error);
    return null;
  }
}

export async function getAssistantResponse(userMessage: string, profile: UserProfile | null, currentEvents: Event[]): Promise<string> {
  try {
    const ai = getAiClient();
    if (!ai) return "I'm sorry, my AI processing is currently offline. Please try again later.";

    const context = `
      User Profile: ${JSON.stringify(profile)}
      Available Opportunities: ${JSON.stringify(currentEvents.map(e => ({ title: e.title, organization: e.organization, type: e.type, isPaid: e.isPaid })))}
    `;

    const prompt = `You are a helpful student opportunity assistant named YuvaHub AI.
    Your goal is to help students find hackathons, scholarships, and programs.
    Use the provided context to answer the user's question accurately.
    If they ask for specific types (e.g., beginner, free, AI-related), look through the available opportunities.
    Be encouraging and concise.
    
    Context: ${context}
    User Message: ${userMessage}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      },
    });

    return response.text;
  } catch (error) {
    console.error("AI Assistant error:", error);
    return "I encountered an error while processing your request. How else can I help you today?";
  }
}

export async function generateDraft(type: 'SOP' | 'Email', opportunityTitle: string, organization: string, profile: UserProfile | null): Promise<string> {
  try {
    const ai = getAiClient();
    if (!ai) return "";

    const prompt = `Draft a professional ${type === 'SOP' ? 'Statement of Purpose' : 'Application Email'} for a student applying to "${opportunityTitle}" at "${organization}".
    Using the profile: ${JSON.stringify(profile)}.
    Ensure it's structured, professional, and includes placeholders where specific details are needed.
    Add a CLEAR DISCLAIMER at the top that the student MUST customize this content.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { },
    });

    return response.text;
  } catch (error) {
    console.error("Draft generation error:", error);
    return "Failed to generate draft. Please try again.";
  }
}
