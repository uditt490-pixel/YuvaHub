import { getGenAI, getCachedResponse, setCachedResponse } from "../api/genai.js";
import { UserProfile, Opportunity, MatchDetails, RecommendationPreferences, RecommendationInteraction } from "../types.js";

// Standard canonical skills directory
const CANONICAL_SKILL_DICTIONARY: Record<string, string[]> = {
  "React": ["react", "react.js", "reactjs", "react native"],
  "TypeScript": ["typescript", "ts"],
  "JavaScript": ["javascript", "js", "es6", "node", "nodejs", "node.js"],
  "Python": ["python", "py", "django", "flask", "fastapi", "pandas", "numpy"],
  "C++": ["c++", "cpp"],
  "Java": ["java", "spring", "springboot"],
  "Go": ["go", "golang"],
  "Rust": ["rust"],
  "Solidity": ["solidity", "ethereum", "smart contracts", "web3"],
  "Machine Learning": ["machine learning", "ml", "ai", "deep learning", "nlp", "llm", "genai", "scikit-learn"],
  "PyTorch": ["pytorch", "torch"],
  "TensorFlow": ["tensorflow", "tf", "keras"],
  "Docker": ["docker", "kubernetes", "k8s", "containers"],
  "AWS": ["aws", "amazon web services", "cloud", "s3", "lambda"],
  "SQL": ["sql", "postgresql", "postgres", "mysql", "sqlite"],
  "MongoDB": ["mongodb", "mongo", "nosql"],
  "GraphQL": ["graphql"],
  "Git": ["git", "github", "version control"],
  "TailwindCSS": ["tailwindcss", "tailwind", "css"],
  "Figma": ["figma", "ui/ux", "ui design"]
};

// Recognized interest categories
const INTEREST_CATEGORIES: Record<string, string[]> = {
  "Open Source": ["open source", "gsoc", "lfx", "outreachy", "hacktoberfest", "github", "git"],
  "Hackathon": ["hackathon", "bounty", "buildathon", "ethglobal", "devpost"],
  "Internship": ["internship", "intern", "fellowship", "trainee", "co-op"],
  "Grant": ["grant", "scholarship", "research grant", "funding", "stipend"],
  "AI & Data Science": ["ai", "ml", "machine learning", "data science", "llm", "gemini", "openai", "deep learning"],
  "Web Development": ["web dev", "frontend", "backend", "full stack", "fullstack", "react", "node"],
  "Web3 & Blockchain": ["web3", "crypto", "blockchain", "solidity", "defi", "nft"],
  "Research": ["research", "paper", "lab", "academic", "phd", "masters"]
};

/**
 * Extract structured canonical skills and interest categories from raw text (e.g. resume or bio)
 */
export function extractSkillsAndInterestsFromText(text: string): { skills: string[]; interests: string[] } {
  if (!text) return { skills: [], interests: [] };
  const lower = text.toLowerCase();

  const detectedSkills = new Set<string>();
  for (const [canonical, keywords] of Object.entries(CANONICAL_SKILL_DICTIONARY)) {
    for (const kw of keywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}s?\\b`, 'i');
      if (regex.test(lower)) {
        detectedSkills.add(canonical);
        break;
      }
    }
  }

  const detectedInterests = new Set<string>();
  for (const [category, keywords] of Object.entries(INTEREST_CATEGORIES)) {
    for (const kw of keywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}s?\\b`, 'i');
      if (regex.test(lower)) {
        detectedInterests.add(category);
        break;
      }
    }
  }

  return {
    skills: Array.from(detectedSkills),
    interests: Array.from(detectedInterests)
  };
}

/**
 * Parse resume text using AI or heuristics to extract candidate profile metrics
 */
export async function parseProfileResumeAndSkills(resumeText: string, bioText?: string) {
  const heuristicResult = extractSkillsAndInterestsFromText(`${resumeText || ''} ${bioText || ''}`);

  const ai = getGenAI();
  if (!ai || !resumeText || resumeText.length < 50) {
    return heuristicResult;
  }

  const cacheKey = `parse_resume:${resumeText.substring(0, 300)}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `Extract standard candidate profile data from this resume text.
Resume text: ${resumeText.substring(0, 3000)}

Return strictly JSON matching this format:
{
  "skills": ["React", "Python", ...],
  "interests": ["Open Source", "AI & Data Science", ...]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text || "";
    const parsed = JSON.parse(text);

    const mergedSkills = Array.from(new Set([...(parsed.skills || []), ...heuristicResult.skills]));
    const mergedInterests = Array.from(new Set([...(parsed.interests || []), ...heuristicResult.interests]));

    const result = { skills: mergedSkills, interests: mergedInterests };
    setCachedResponse(cacheKey, result);
    return result;
  } catch (err) {
    return heuristicResult;
  }
}

/**
 * Calculate 0-100% Profile Completeness score with detailed breakdown
 */
export function calculateProfileCompletenessScore(profile: Partial<UserProfile>, resumesCount: number = 0) {
  let score = 0;
  const breakdown: Record<string, { earned: number; max: number; title: string }> = {
    basicInfo: { earned: 0, max: 15, title: "Basic Contact Details" },
    education: { earned: 0, max: 20, title: "Education & Field of Study" },
    skills: { earned: 0, max: 20, title: "Skills & Technical Stack" },
    bioAndLinks: { earned: 0, max: 15, title: "Bio & Social Profiles" },
    resume: { earned: 0, max: 20, title: "Resume Upload" },
    interests: { earned: 0, max: 10, title: "Career Interests & Preferences" }
  };

  const missingFields: { field: string; suggestion: string }[] = [];

  // 1. Basic Info (15%)
  if (profile.name && profile.email) {
    let earned = 10;
    if (profile.city || profile.country || profile.phone) earned += 5;
    breakdown.basicInfo.earned = earned;
    score += earned;
  } else {
    missingFields.push({ field: "basicInfo", suggestion: "Add your full name and contact location." });
  }

  // 2. Education (20%)
  if (profile.college || profile.field || profile.year) {
    let earned = 10;
    if (profile.college && profile.field) earned = 20;
    breakdown.education.earned = earned;
    score += earned;
  } else {
    missingFields.push({ field: "education", suggestion: "Fill in your college, degree, and target field of study." });
  }

  // 3. Skills (20%)
  const userSkillsCount = (profile.skills?.length || 0) + (profile.canonicalSkills?.length || 0);
  if (userSkillsCount > 0) {
    let earned = 10;
    if (userSkillsCount >= 3) earned = 20;
    breakdown.skills.earned = earned;
    score += earned;
  } else {
    missingFields.push({ field: "skills", suggestion: "List your top technical and domain skills." });
  }

  // 4. Bio & Links (15%)
  let bioEarned = 0;
  if (profile.bio && profile.bio.trim().length > 10) bioEarned += 7;
  if (profile.githubUrl || profile.linkedinUrl || profile.portfolioUrl) bioEarned += 8;
  breakdown.bioAndLinks.earned = bioEarned;
  score += bioEarned;
  if (bioEarned < 15) {
    missingFields.push({ field: "bioAndLinks", suggestion: "Add a bio and link your GitHub or LinkedIn profile." });
  }

  // 5. Resume (20%)
  if (resumesCount > 0 || (profile.resumeUrl && profile.resumeUrl.trim() !== '')) {
    breakdown.resume.earned = 20;
    score += 20;
  } else {
    missingFields.push({ field: "resume", suggestion: "Upload your resume to significantly boost your AI recommendations." });
  }

  // 6. Interests & Preferences (10%)
  if ((profile.interests && profile.interests.length > 0) || profile.recommendationPreferences) {
    breakdown.interests.earned = 10;
    score += 10;
  } else {
    missingFields.push({ field: "interests", suggestion: "Set your opportunity interest preferences (e.g. Open Source, Hackathons)." });
  }

  const finalScore = Math.min(100, Math.max(0, score));
  return {
    score: finalScore,
    breakdown,
    missingFields
  };
}

/**
 * Calculate 0-100% dynamic match score between a candidate profile and an opportunity
 */
export function calculateOpportunityMatch(
  profile: Partial<UserProfile>,
  opportunity: Partial<Opportunity>,
  interactions: RecommendationInteraction[] = [],
  preferences?: RecommendationPreferences
): MatchDetails {
  const oppTags = (opportunity.tags || []).map(t => t.toLowerCase());
  const oppType = (opportunity.type || '').toLowerCase();
  const oppTitle = (opportunity.title || '').toLowerCase();
  const oppDesc = (opportunity.description || '').toLowerCase();
  const oppLoc = (opportunity.location || '').toLowerCase();

  const userSkills = Array.from(new Set([
    ...(profile.skills || []),
    ...(profile.canonicalSkills || [])
  ])).map(s => s.toLowerCase());

  const userInterests = (profile.interests || []).map(i => i.toLowerCase());

  // 1. Skill Match Score (Max 40 points)
  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  const checkText = `${oppTitle} ${oppTags.join(' ')} ${oppDesc}`;

  // Check known canonical dictionary
  for (const [canonical, synonyms] of Object.entries(CANONICAL_SKILL_DICTIONARY)) {
    const canonicalLower = canonical.toLowerCase();
    const matchesOpp = synonyms.some(syn => checkText.includes(syn));
    if (matchesOpp) {
      const hasUserSkill = userSkills.some(us => us === canonicalLower || synonyms.some(syn => us.includes(syn)));
      if (hasUserSkill) {
        if (!matchingSkills.includes(canonical)) matchingSkills.push(canonical);
      } else {
        if (!missingSkills.includes(canonical)) missingSkills.push(canonical);
      }
    }
  }

  let skillScore = 0;
  if (matchingSkills.length > 0) {
    const matchRatio = matchingSkills.length / Math.max(1, matchingSkills.length + Math.min(3, missingSkills.length));
    skillScore = Math.round(matchRatio * 40);
  } else if (userSkills.length > 0) {
    // Check direct substring matches
    const directMatches = userSkills.filter(s => checkText.includes(s));
    if (directMatches.length > 0) {
      skillScore = Math.min(30, directMatches.length * 10);
      matchingSkills.push(...directMatches.map(s => s.toUpperCase()));
    } else {
      skillScore = 10; // Baseline candidate bonus
    }
  } else {
    skillScore = 12; // Baseline bonus when no skills specified
  }

  // 2. Interest & Opportunity Type Match (Max 25 points)
  let typeScore = 0;
  let typeMatch = false;

  const prefTypes = (preferences?.preferredTypes || []).map(pt => pt.toLowerCase());
  const combinedInterests = Array.from(new Set([...userInterests, ...prefTypes]));

  if (combinedInterests.length > 0) {
    const matchesCategory = combinedInterests.some(interest => 
      oppType.includes(interest) || oppTitle.includes(interest) || oppTags.some(t => t.includes(interest))
    );
    if (matchesCategory) {
      typeScore = 25;
      typeMatch = true;
    } else {
      typeScore = 12;
    }
  } else {
    typeScore = 18;
  }

  // 3. Education / Field Alignment (Max 15 points)
  let eduScore = 10;
  if (profile.field) {
    const fieldLower = profile.field.toLowerCase();
    if (checkText.includes(fieldLower) || (fieldLower.includes("computer") && (oppType.includes("hackathon") || oppType.includes("grant") || oppTags.includes("python")))) {
      eduScore = 15;
    }
  }

  // 4. Location & Remote Preference (Max 10 points)
  let locScore = 8;
  let locationMatch = false;

  if (preferences?.remoteOnly) {
    if (oppLoc.includes('remote') || oppLoc.includes('global') || oppLoc.includes('online')) {
      locScore = 10;
      locationMatch = true;
    } else {
      locScore = 3;
    }
  } else if (preferences?.preferredLocations && preferences.preferredLocations.length > 0) {
    const matchesLoc = preferences.preferredLocations.some(pl => oppLoc.includes(pl.toLowerCase()));
    if (matchesLoc) {
      locScore = 10;
      locationMatch = true;
    }
  } else {
    locScore = 10;
  }

  // 5. User Interaction Telemetry Feedback (Max +10 / -20 points)
  let interactionModifier = 0;
  const oppId = opportunity.id || (opportunity as any)._id?.toString();

  for (const inter of interactions) {
    if (inter.opportunityId === oppId) {
      if (inter.interactionType === 'dismiss') interactionModifier -= 35;
      if (inter.interactionType === 'apply') interactionModifier += 10;
      if (inter.interactionType === 'save') interactionModifier += 8;
    } else {
      // Check if interaction tags overlap
      const tagOverlap = (inter.tags || []).some(t => oppTags.includes(t.toLowerCase()));
      if (tagOverlap) {
        if (inter.interactionType === 'apply' || inter.interactionType === 'save') {
          interactionModifier += 3;
        } else if (inter.interactionType === 'dismiss') {
          interactionModifier -= 5;
        }
      }
    }
  }

  // Calculate final raw score
  let totalScore = skillScore + typeScore + eduScore + locScore + interactionModifier;

  // Additional Target Role alignment
  if (preferences?.targetRole) {
    const roleLower = preferences.targetRole.toLowerCase();
    if (oppTitle.includes(roleLower) || oppDesc.includes(roleLower)) {
      totalScore += 5;
    }
  }

  const finalScore = Math.min(99, Math.max(25, totalScore));

  return {
    matchScore: finalScore,
    matchingSkills: matchingSkills.slice(0, 5),
    missingSkills: missingSkills.slice(0, 5),
    typeMatch,
    locationMatch
  };
}

/**
 * Generate AI "Why this opportunity?" explanation
 */
export async function generateMatchExplanation(
  profile: Partial<UserProfile>,
  opportunity: Partial<Opportunity>,
  matchDetails: MatchDetails
): Promise<string> {
  const cacheKey = `match_exp:${opportunity.id || opportunity.title}:${profile.uid || profile.name}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) return cached;

  const defaultExplanation = `This opportunity aligns ${matchDetails.matchScore}% with your profile because it matches your focus in ${opportunity.type || 'technology'} and key skills (${matchDetails.matchingSkills.join(', ') || 'software engineering'}). ${matchDetails.missingSkills.length > 0 ? `Consider expanding your knowledge in ${matchDetails.missingSkills.slice(0, 2).join(', ')} to stand out.` : 'Your profile matches all primary prerequisites!'}`;

  const ai = getGenAI();
  if (!ai) return defaultExplanation;

  try {
    const prompt = `You are YuvaHub AI Career Coach. Write a concise, 2-3 sentence personalized explanation for why this opportunity is matched to the student.
Candidate Profile: Name: ${profile.name || 'Candidate'}, Field: ${profile.field || 'Tech'}, Skills: ${(profile.skills || []).join(', ')}
Opportunity: Title: ${opportunity.title}, Type: ${opportunity.type}, Tags: ${(opportunity.tags || []).join(', ')}
Calculated Match Score: ${matchDetails.matchScore}%
Matching Skills: ${matchDetails.matchingSkills.join(', ')}
Missing Skills: ${matchDetails.missingSkills.join(', ')}

Explain clearly:
1. Why it aligns with their skills/interests.
2. What key skill bonus they can gain or learn.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    const text = response.text ? response.text.trim() : defaultExplanation;
    setCachedResponse(cacheKey, text);
    return text;
  } catch (err) {
    return defaultExplanation;
  }
}

/**
 * Rank and annotate opportunities with personalized recommendation scores
 */
export function rankRecommendationsForUser(
  profile: Partial<UserProfile>,
  opportunities: Partial<Opportunity>[],
  interactions: RecommendationInteraction[] = [],
  preferences?: RecommendationPreferences,
  options: { minScore?: number; type?: string; limit?: number; offset?: number } = {}
) {
  const { minScore = 0, type, limit = 20, offset = 0 } = options;

  let scoredItems = opportunities.map(opp => {
    const match = calculateOpportunityMatch(profile, opp, interactions, preferences);
    return {
      ...opp,
      matchScore: match.matchScore,
      matchDetails: match
    };
  });

  // Filter by minScore
  if (minScore > 0) {
    scoredItems = scoredItems.filter(item => item.matchScore >= minScore);
  }

  // Filter by type
  if (type && type !== 'All') {
    scoredItems = scoredItems.filter(item => 
      (item.type && item.type.toLowerCase().includes(type.toLowerCase())) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(type.toLowerCase())))
    );
  }

  // Sort descending by matchScore
  scoredItems.sort((a, b) => b.matchScore - a.matchScore);

  const paginated = scoredItems.slice(offset, offset + limit);

  return {
    items: paginated,
    total: scoredItems.length,
    offset,
    limit
  };
}
