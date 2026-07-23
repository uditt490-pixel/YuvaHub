const robustParseJSON = (text: string): any => {
  if (!text) return null;
  try {
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    const lastBrace = text.lastIndexOf('}');
    const lastBracket = text.lastIndexOf(']');

    let start = -1;
    let end = -1;

    const isArray = firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace);
    
    if (isArray) {
      start = firstBracket;
      end = lastBracket;
    } else {
      start = firstBrace;
      end = lastBrace;
    }

    if (start !== -1 && end !== -1 && end > start) {
      const jsonStr = text.substring(start, end + 1);
      return JSON.parse(jsonStr);
    }
    
    return JSON.parse(text);
  } catch (e) {
    console.error("[JSON Parse Error] Raw text:", text);
    return null;
  }
};

async function generatedContentProxy(prompt: string, expectJson: boolean = false) {
  try {
    const res = await fetch("/api/v1/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, expectJson })
    });
    const data = await res.json();
    return data.text || "";
  } catch (e) {
    console.error("AI Proxy Error:", e);
    return "";
  }
}

export async function generateSmartFeed(profile: any, page: number = 1) {
  const prompt = `Return a JSON array of 5 unique student opportunities (internships, hackathons, etc) matching this profile: ${JSON.stringify(profile)}. Page: ${page}. Return JSON ONLY. Schema: [{id, title, type, organization, tags:[], deadline, apply_link, description, match_score}]`;
  const text = await generatedContentProxy(prompt, true);
  const items = robustParseJSON(text);
  if (items && (Array.isArray(items) || Array.isArray(items.items))) {
    return Array.isArray(items) ? items : items.items;
  }
  return [];
}

export async function generateExploreFeed(page: number = 1) {
  const prompt = `Return a JSON array of 5 generic/popular student opportunities globally. Page: ${page}. Return JSON ONLY. Schema: [{id, title, type, organization, tags:[], deadline, apply_link, description}]`;
  const text = await generatedContentProxy(prompt, true);
  const items = robustParseJSON(text);
  if (items && (Array.isArray(items) || Array.isArray(items.items))) {
    return Array.isArray(items) ? items : items.items;
  }
  return [];
}

export async function generateApplyDraft(opportunity: any, profile: any) {
  const prompt = `Write a short professional cover letter draft for: ${opportunity.title} at ${opportunity.organization}. Candidate: ${profile.name}, Skills: ${profile.skills?.join(",")}. Keep it concise.`;
  return await generatedContentProxy(prompt);
}

export async function refineSearchQuery(query: string, profile: any) {
  const prompt = `Refine this search query for a student: "${query}". Profile context: ${profile?.field || 'Tech'}. Return ONLY the refined query string, max 5 words.`;
  const text = await generatedContentProxy(prompt);
  return text.trim() || query;
}

export async function runScoutProtocol(parameters: any, profile: any) {
  const prompt = `Perform a "Scout Protocol" search. Profile: ${JSON.stringify(profile)}, Goals: ${JSON.stringify(parameters)}. Return JSON ONLY: {results: [{title, org, type, deadline, apply_link, match_reason, id}], agent_note: "..."}`;
  const text = await generatedContentProxy(prompt, true);
  return robustParseJSON(text) || { results: [], agent_note: "Search failed." };
}

export async function checkScholarshipEligibility(scholarship: any, profile: any) {
  const prompt = `Can this student apply for this scholarship?\nProfile: ${JSON.stringify(profile)}\nScholarship: ${JSON.stringify(scholarship)}\nReturn JSON ONLY: { eligible: boolean, reasons: string[] }`;
  const text = await generatedContentProxy(prompt, true);
  return robustParseJSON(text) || { eligible: false, reasons: ["Could not verify."] };
}

export async function extractResumeData(resumeText: string) {
  const prompt = `Extract structured data from the following resume text. Return JSON ONLY with this schema:
  {
    "education": [{"degree": "...", "institution": "...", "dates": "...", "gpa": "..."}],
    "workExperience": [{"company": "...", "role": "...", "dates": "...", "impact": "..."}],
    "rawSkills": ["skill1", "skill2"]
  }
  
  Resume Text:
  ${resumeText}`;
  const text = await generatedContentProxy(prompt, true);
  return robustParseJSON(text) || { education: [], workExperience: [], rawSkills: [] };
}

export async function chatWithMentor(messages: {role: string, content: string}[], message: string) {
  const prompt = `You are an AI Career Mentor for a student. Context of chat:\n${JSON.stringify([...messages, {role: 'user', content: message}])}\nRespond to the latest message. Be concise, encouraging, and provide actionable advice.`;
  const result = await generatedContentProxy(prompt);
  if (!result || result.trim() === "" || result.toLowerCase().includes("disabled") || result.toLowerCase().includes("failed")) {
    return mockCareerAdvice(message);
  }
  return result;
}

function mockCareerAdvice(message: string): string {
  const m = message.toLowerCase();
  
  // 1. GSoC / Open Source
  if (m.includes("gsoc") || m.includes("open source")) {
    return JSON.stringify({
      text: "Open-source development is one of the highest-signal elements on a student resume! Google Summer of Code (GSoC) is a phenomenal way to start. Here is a recommended roadmap:\n\n1. Learn Git thoroughly (branching, merging, pull requests).\n2. Find small issues labeled 'good first issue' in repositories you care about.\n3. Draft a precise design proposal outlining your timelines and deliverables.\n\nI highly recommend starting with the main GSoC open fellowship!",
      card: {
        title: "Google Summer of Code (GSoC) - Open Source Fellow",
        org: "Google Open Source",
        type: "Fellowship",
        description: "An intensive global program focused on bringing student developers into open source software development. Work with a mentor organization on a real-world software project throughout the summer.",
        deadline: "12 days left",
        applyLink: "https://summerofcode.withgoogle.com"
      },
      options: [
        "What skills do I need for ML internships?",
        "Review my LinkedIn summary",
        "I'm a 2nd year CSE student, what should I do next?"
      ]
    });
  }

  // 2. Resume / LinkedIn / CV
  if (m.includes("resume") || m.includes("cv") || m.includes("linkedin") || m.includes("review")) {
    return JSON.stringify({
      text: "Crafting a stellar technical resume is a critical first step. Always prioritize impact over generic tasks:\n\n- Instead of: 'Worked on software integrations using Python.'\n- Try: 'Designed high-availability backend Python APIs, reducing database response times by 35% across 5 services.'\n\n- Quantify every achievement (e.g., scale, latency reductions, user count).\n- Put your most hands-on, end-to-end projects at the top.",
      options: [
        "What skills do I need for ML internships?",
        "How do I get into GSoC?",
        "I'm a 2nd year CSE student, what should I do next?"
      ]
    });
  }

  // 3. ML / Machine Learning / AI
  if (m.includes("ml") || m.includes("machine learning") || m.includes("ai") || m.includes("data science")) {
    return JSON.stringify({
      text: "The Machine Learning landscape is highly competitive but incredibly rewarding! Focus on solid software engineering fundamentals first, then specialize:\n\n1. **Theoretical Foundations**: Master Linear Algebra, Probability, and Gradient Descent.\n2. **Hands-on Frameworks**: Build models end-to-end using PyTorch, HuggingFace, or Scikit-Learn.\n3. **Deployment**: Learn how to deploy models via FastAPI or serve them efficiently on web clients.\n\nCheck out this outstanding research internship at Meta Research!",
      card: {
        title: "Artificial Intelligence Research Student Fellowship",
        org: "Meta Research",
        type: "Fellowship",
        description: "Work directly with Meta scientists on foundational models, reinforcement learning, computer vision, and NLP architectures. Gain access to custom GPU compute clusters.",
        deadline: "Rolling admission",
        applyLink: "https://research.facebook.com"
      },
      options: [
        "How do I get into GSoC?",
        "Review my LinkedIn summary",
        "I'm a 2nd year CSE student, what should I do next?"
      ]
    });
  }

  // 4. CSE / 2nd year / 1st year / student / college / year
  if (m.includes("2nd year") || m.includes("second year") || m.includes("1st year") || m.includes("first year") || m.includes("student") || m.includes("next step") || m.includes("cse")) {
    return JSON.stringify({
      text: "Being a CSE student is an exciting journey! Here is your core focus area based on your year:\n\n- **1st Year**: Lock down foundational programming (C++, Python, or Java) and get comfortable with basics of computer networks and Git.\n- **2nd Year**: Focus heavily on Algorithms & Data Structures (DSA), open source contributions (like GSoC), and build 2 major end-to-end projects.\n- **3rd/4th Year**: Secure a stellar summer internship, perfect your system design fundamentals, and prepare for technical interviews.\n\nHere is Microsoft's great technology showcase hackathon, perfect for 1st & 2nd years:",
      card: {
        title: "Microsoft Imagine Cup - Social Impact Tech Challenge",
        org: "Microsoft",
        type: "Hackathon",
        description: "Launch your startup with the Imagine Cup. Show off your technical skills, develop a creative social-impact solution using Azure Cloud, and win funding, mentorship, and global recognition.",
        deadline: "Rolling admission",
        applyLink: "https://imaginecup.microsoft.com"
      },
      options: [
        "What skills do I need for ML internships?",
        "How do I get into GSoC?",
        "Review my LinkedIn summary"
      ]
    });
  }

  // 5. Internship / job / placement / hft / finance
  if (m.includes("internship") || m.includes("intern") || m.includes("job") || m.includes("hire") || m.includes("hiring")) {
    return JSON.stringify({
      text: "Securing an internship requires a combination of high-quality applications and targeted networking:\n\n1. **Build a Portfolio**: Host complete, functional projects on GitHub, write pristine READMEs, and pin them.\n2. **Target Fast-growing Tech**: Highlight your engineering rigor and ability to build APIs and clean reactive systems.\n3. **Practice Cold Outreach**: Reach out to engineering managers on LinkedIn describing *exactly* how you can add value to their team.\n\nHere's an amazing, elite software internship that is currently looking for talented students:",
      card: {
        title: "Software Engineering Summer Intern - Infrastructure & APIs",
        org: "Stripe",
        type: "Internship",
        description: "Collaborate with talented engineers on Stripe's core payment infrastructure, web hooks, billing systems, and high-availability developer APIs. Write pristine, thoroughly-tested TypeScript and Ruby systems.",
        deadline: "Enrollment Open",
        applyLink: "https://stripe.com/jobs"
      },
      options: [
        "What skills do I need for ML internships?",
        "How do I get into GSoC?",
        "Review my LinkedIn summary"
      ]
    });
  }

  // General Fallback
  return JSON.stringify({
    text: "I am Yuva, your dedicated AI Career Mentor. I'm here to help you navigate your academic focus, map out high-signal technical skills, refine your resume, and discover pristine student opportunities.\n\n*(Note: This response was provided by a local fallback system because our AI service is currently experiencing high traffic.)*\n\nWhat specifically can I help you build or explore today?",
    options: [
      "How do I get into GSoC?",
      "Review my LinkedIn summary",
      "What skills do I need for ML internships?",
      "I'm a 2nd year CSE student, what should I do next?"
    ]
  });
}

