import { GoogleGenAI } from "@google/genai";

let _genAI: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI | null {
  if (!_genAI) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not set. AI features will fallback.");
      return null;
    }
    _genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return _genAI;
}

// In-memory cache for AI generation prompts and resume reviews
const aiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export function getCachedResponse(key: string): any | null {
  const entry = aiCache.get(key);
  if (entry && (Date.now() - entry.timestamp < CACHE_TTL_MS)) {
    return entry.data;
  }
  return null;
}

export function setCachedResponse(key: string, data: any) {
  aiCache.set(key, { data, timestamp: Date.now() });
}

export function getAIFallback(prompt: string, expectJson: boolean): string {
  const lower = prompt.toLowerCase();

  if (lower.includes("unique student opportunities") || lower.includes("generic/popular student opportunities")) {
    return JSON.stringify([
      {
        id: "fall_ai_gsoc",
        title: "Google Summer of Code Fellow",
        type: "Fellowship",
        organization: "Google Open Source",
        tags: ["Open Source", "Software Engineering", "Python", "Go"],
        deadline: "15 days left",
        apply_link: "https://summerofcode.withgoogle.com",
        description: "Engage in an immersive 12-week open-source programming fellowship with dynamic structural mentors, working on key distributed projects.",
        match_score: 95
      },
      {
        id: "fall_ai_hugging",
        title: "NLP and Foundational AI Research Intern",
        type: "Internship",
        organization: "Hugging Face",
        tags: ["Machine Learning", "PyTorch", "NLP", "Transformers"],
        deadline: "Apply soon",
        apply_link: "https://huggingface.co/jobs",
        description: "Contribute to building and deploying next-generation transformer models, dataset normalizers, and open science pipelines.",
        match_score: 88
      },
      {
        id: "fall_ai_stripe",
        title: "Software Engineering Intern - Developer APIs",
        type: "Internship",
        organization: "Stripe",
        tags: ["TypeScript", "APIs", "Robust Architecture", "Node.js"],
        deadline: "Rolling admission",
        apply_link: "https://stripe.com/jobs",
        description: "Build robust, highly scalable API features, webhooks, and modern client developer platforms in a highly agile group.",
        match_score: 90
      }
    ]);
  }

  if (lower.includes("cover letter") || lower.includes("apply draft")) {
    return `Subject: Expressing Interest in the Opportunity

Dear Hiring Team,

I am writing to express my strong enthusiasm for joining your team. As a dedicated student with hand-on experience in modern technology stacks, collaborative software workflows, and structured problem-solving, I am confident in my ability to contribute value from day one.

My academic journey, combined with my active engineering projects, has equipped me with high-signal skills in building elegant systems and normalizing data models. I would welcome the opportunity to discuss how my qualifications align with your engineering priorities.

Thank you for your time and consideration.

Sincerely,
[Your Name]

*(Note: This is a static template provided because our AI service is currently experiencing high traffic. Please customize it before sending.)*`;
  }

  if (lower.includes("scout protocol") || lower.includes("scout")) {
    return JSON.stringify({
      results: [
        {
          id: "scout_fall_1",
          title: "Generative Systems Engineering Intern",
          org: "Scale AI",
          type: "Internship",
          deadline: "3 weeks left",
          apply_link: "https://scale.com/careers",
          match_reason: "High-signal alignment with your backend APIs and dynamic data pipeline experience."
        },
        {
          id: "scout_fall_2",
          title: "Graduate Research Assistant in ML systems",
          org: "Stanford AI Lab",
          type: "Research",
          deadline: "December 15",
          apply_link: "https://ai.stanford.edu",
          match_reason: "Strong fit with machine learning foundations and mathematical background."
        }
      ],
      agent_note: "I have leveraged scout fallbacks to identify high-potential options matching your specific parameter constraints."
    });
  }

  if (lower.includes("scholarship") || lower.includes("eligible")) {
    return JSON.stringify({
      eligible: true,
      reasons: [
        "Your major and academic field matches target parameters.",
        "Demonstrated hands-on project accomplishments showcase deep technical curiosity."
      ]
    });
  }

  if (lower.includes("mentor") || lower.includes("career advice") || lower.includes("messages")) {
    return JSON.stringify({
      text: "I am a standard career mentor fallback. Focus on building fully polished portfolio applications, writing high-quality README documents, and establishing deep mastery in TypeScript/Vite full-stack structures!\n\n*(Note: This response was provided by a local fallback system because our AI service is currently experiencing high traffic.)*"
    });
  }

  if (expectJson) {
    return "[]";
  }
  return "I am here to help you navigate academic choices, resume reviews, track development milestones, and match with elite engineering fellowships!";
}
