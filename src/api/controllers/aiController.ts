import { Request, Response } from "express";
import { getGenAI, getAIFallback, getCachedResponse, setCachedResponse } from "../genai.js";

export const aiGenerate = async (req: Request, res: Response) => {
  try {
    const { prompt, expectJson } = req.body;
    if (!prompt) return res.status(400).json({ error: "No prompt" });

    const cached = getCachedResponse(prompt);
    if (cached) {
      return res.json({ text: cached });
    }

    const ai = getGenAI();
    if (!ai) {
      const fb = getAIFallback(prompt, !!expectJson);
      return res.json({ text: fb });
    }

    let responseText = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      responseText = response.text || "";
    } catch (err: any) {
      const is503 = err?.status === 503 || err?.message?.includes('503') || err?.message?.includes('high demand');
      const isTimeout = err?.message?.toLowerCase().includes('timeout') || err?.message?.toLowerCase().includes('abort');
      const is429 = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('Quota exceeded') || err?.message?.includes('RESOURCE_EXHAUSTED');
      if (is503 || isTimeout || is429) {
        console.log(`[AI Routing] Switchover triggered due to temporary limit.`);
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt
          });
          responseText = response.text || "";
        } catch (liteErr: any) {
          console.log(`[AI Routing] Alternate model restriction. Invoking static fallback strategy.`);
          responseText = getAIFallback(prompt, !!expectJson);
        }
      } else {
        responseText = getAIFallback(prompt, !!expectJson);
      }
    }

    if (!responseText) {
      responseText = getAIFallback(prompt, !!expectJson);
    }

    setCachedResponse(prompt, responseText);
    res.json({ text: responseText });
  } catch (err) {
    const { prompt, expectJson } = req.body;
    const fallback = getAIFallback(prompt || "", !!expectJson);
    res.json({ text: fallback });
  }
};

export const aiResumeReview = async (req: Request, res: Response) => {
  try {
    const { resume } = req.body;
    if (!resume) return res.status(400).json({ error: "No resume provided" });

    const cacheKey = `resume_review:${resume.substring(0, 300)}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const defaultFallback = {
      score: 82,
      strengths: ["Clean structure and section flow", "Clear contact details and header"],
      weaknesses: ["Requires more quantifiable impact metrics", "Descriptions of projects are relatively short"],
      suggestions: ["Incorporate metrics such as performance gains, scale size, or user retention count", "Use active, strong action verbs to begin bullet points"]
    };

    const ai = getGenAI();
    if (!ai) {
      return res.json(defaultFallback);
    }

    const prompt = `Review this student resume for structure, impact, and ATS readiness. 
Resume text: ${resume}
Return JSON strictly in this format:
{
  "score": (number 1-100),
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "suggestions": ["...", "..."]
}`;

    let responseText = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      responseText = response.text || "";
    } catch (err: any) {
      const is503 = err?.status === 503 || err?.message?.includes('503') || err?.message?.includes('high demand');
      const isTimeout = err?.message?.toLowerCase().includes('timeout') || err?.message?.toLowerCase().includes('abort');
      const is429 = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('Quota exceeded') || err?.message?.includes('RESOURCE_EXHAUSTED');
      if (is503 || isTimeout || is429) {
        console.log(`[AI Routing] Review switchover active.`);
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
            config: { responseMimeType: "application/json" }
          });
          responseText = response.text || "";
        } catch (liteErr) {
          console.log(`[AI Routing] Review fallback activated.`);
        }
      }
    }

    let parsed = defaultFallback;
    if (responseText) {
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        try {
          const firstBrace = responseText.indexOf('{');
          const lastBrace = responseText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            parsed = JSON.parse(responseText.substring(firstBrace, lastBrace + 1));
          }
        } catch (e2) { }
      }
    }

    setCachedResponse(cacheKey, parsed);
    res.json(parsed);
  } catch (err) {
    res.json({
      score: 82,
      strengths: ["Clean structure and section flow", "Clear contact details and header"],
      weaknesses: ["Requires more quantifiable impact metrics", "Descriptions of projects are relatively short"],
      suggestions: ["Incorporate metrics such as performance gains, scale size, or user retention count", "Use active, strong action verbs to begin bullet points"]
    });
  }
};

export const handleCareerRoadmap = async (req: Request, res: Response) => {
  try {
    const { education, targetRole, currentSkills, timeframe } = req.body;
    if (!targetRole) {
      return res.status(400).json({ error: "Target role is required" });
    }

    const roleStr = targetRole || "Software Engineer";
    const eduStr = education || "Computer Science Student";
    const skillsStr = currentSkills || "Programming Basics, Problem Solving";
    const timeStr = timeframe || "6 Months";

    const cacheKey = `career_roadmap:${roleStr}:${eduStr}:${skillsStr}:${timeStr}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const defaultFallback = {
      title: `${roleStr} Career Roadmap`,
      overview: `A structured learning and project path to help you master ${roleStr} within ${timeStr}.`,
      estimatedTimeframe: timeStr,
      targetRole: roleStr,
      milestones: [
        { step: 1, title: "Core Fundamentals & Tooling Mastery", duration: "Month 1", description: "Master the foundational languages, version control, and core software engineering concepts for your target role.", topics: ["Data Structures & Algorithms", "Git & GitHub Workflow", "Modern Syntax & Language Specs", "Command Line & Terminal Power Tools"], projectIdea: "Build a responsive personal developer portfolio and CLI utility tool", recommendedResources: ["FreeCodeCamp", "MDN Web Docs", "GitHub Skills"] },
        { step: 2, title: "Domain Specialization & Modern Frameworks", duration: "Month 2-3", description: "Deep dive into production-grade frameworks, state management, and ecosystem architecture.", topics: ["Framework Architecture", "State Management & Reactivity", "API Integration & Async Flow", "Automated Testing & Linting"], projectIdea: "Build an interactive, real-time web dashboard with filtering and search", recommendedResources: ["Official Framework Documentation", "Frontend Masters", "Coursera Specialization"] },
        { step: 3, title: "Backend Services, Databases & Security", duration: "Month 4", description: "Learn how to build scalable backend APIs, structure databases, and handle authentication.", topics: ["REST & GraphQL API Design", "Relational & NoSQL Databases", "Authentication (JWT / OAuth)", "Middleware & Validation"], projectIdea: "Develop a full-stack platform with user auth, database persistence, and payment integration", recommendedResources: ["MongoDB University", "Node.js Best Practices", "OWASP Security Guide"] },
        { step: 4, title: "System Design, Cloud & Deployment", duration: "Month 5", description: "Understand cloud deployment pipelines, CI/CD, system architecture, and performance optimization.", topics: ["Docker Containerization", "CI/CD GitHub Actions", "Cloud Deployment (Render/AWS/Vercel)", "Performance & Caching"], projectIdea: "Deploy your full-stack app with containerized microservices and automated CI/CD pipeline", recommendedResources: ["System Design Primer", "Docker Docs", "AWS Free Tier Labs"] },
        { step: 5, title: "Portfolio Polish, Open Source & Job Readiness", duration: "Month 6", description: "Finalize high-impact resume projects, contribute to open-source software, and practice technical interviews.", topics: ["Open Source Contribution", "Resume & Portfolio Review", "Mock Technical Interviews", "Networking & Application Strategy"], projectIdea: "Submit a major pull request to a popular open-source project in your domain", recommendedResources: ["LeetCode / HackerRank", "First Timers Only", "YuvaHub Mock Interview Prep"] }
      ]
    };

    const ai = getGenAI();
    if (!ai) {
      return res.json(defaultFallback);
    }

    const prompt = `You are a senior engineering mentor. Build a structured, step-by-step career roadmap for a student.
Target Role: ${roleStr}
Current Education Level: ${eduStr}
Current Known Skills: ${skillsStr}
Desired Timeframe: ${timeStr}

Return ONLY a JSON object strictly adhering to this schema:
{
  "title": string,
  "overview": string,
  "estimatedTimeframe": string,
  "targetRole": string,
  "milestones": [
    {
      "step": number,
      "title": string,
      "duration": string,
      "description": string,
      "topics": string[],
      "projectIdea": string,
      "recommendedResources": string[]
    }
  ]
}`;

    let responseText = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      responseText = response.text || "";
    } catch (err: any) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
        responseText = response.text || "";
      } catch (liteErr) { }
    }

    let parsed = defaultFallback;
    if (responseText) {
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        try {
          const firstBrace = responseText.indexOf('{');
          const lastBrace = responseText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            parsed = JSON.parse(responseText.substring(firstBrace, lastBrace + 1));
          }
        } catch (e2) { }
      }
    }

    setCachedResponse(cacheKey, parsed);
    res.json(parsed);
  } catch (err) {
    console.error("/api/ai/career-roadmap error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const analyzeResume = async (req: Request, res: Response) => {
  try {
    const { resumeBase64, fileName, jobDescription, resumeText } = req.body;
    if (!resumeBase64 && !resumeText) {
      return res.status(400).json({ error: "No resume file or text provided" });
    }
    if (!jobDescription) {
      return res.status(400).json({ error: "No job description provided" });
    }

    const cacheInput = resumeBase64 ? resumeBase64.substring(0, 200) : (resumeText || "").substring(0, 200);
    const cacheKey = `resume_analysis:${cacheInput}:${jobDescription.substring(0, 100)}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const defaultFallback = {
      score: 75,
      missingKeywords: ["TypeScript", "Vite", "MongoDB", "REST APIs"],
      strengths: ["Clear layout and readable contact information", "Detailed description of academic projects"],
      weaknesses: ["Missing quantifiable project scale or metrics", "Lacks modern developer toolings integration"],
      suggestions: ["Add metrics like request rates or load times to demonstrate impact", "Integrate a modern design framework keyword"]
    };

    const ai = getGenAI();
    if (!ai) {
      console.warn("Gemini AI client not available, returning fallback.");
      return res.json(defaultFallback);
    }

    let contents: any[] = [];
    if (resumeBase64) {
      contents.push({
        inlineData: {
          data: resumeBase64.replace(/^data:application\/pdf;base64,/, ""),
          mimeType: "application/pdf"
        }
      });
    } else {
      contents.push({ text: `Resume plain text content:\n${resumeText}` });
    }

    contents.push({
      text: `You are an expert recruiter and resume reviewer.
        Analyze this resume for compatibility with the following target Job Description.
        
        Job Description:
        ${jobDescription}
        
        Evaluate the compatibility score (0-100), identify key missing keywords, list strengths, list weaknesses, and provide layout/structural optimization suggestions.
        Return ONLY a JSON object matching this schema:
        {
          "score": number,
          "missingKeywords": string[],
          "strengths": string[],
          "weaknesses": string[],
          "suggestions": string[]
        }
        `
    });

    let responseText = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: { responseMimeType: "application/json" }
      });
      responseText = response.text || "";
    } catch (err: any) {
      console.error("Gemini API call failed:", err);
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: contents,
          config: { responseMimeType: "application/json" }
        });
        responseText = response.text || "";
      } catch (liteErr) {
        console.error("Gemini Alternate model failed:", liteErr);
      }
    }

    let parsed = defaultFallback;
    if (responseText) {
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        try {
          const firstBrace = responseText.indexOf('{');
          const lastBrace = responseText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            parsed = JSON.parse(responseText.substring(firstBrace, lastBrace + 1));
          }
        } catch (e2) { }
      }
    }

    setCachedResponse(cacheKey, parsed);
    res.json(parsed);
  } catch (err) {
    console.error("/api/ai/analyze-resume error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
