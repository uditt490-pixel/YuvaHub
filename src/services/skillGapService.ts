import { analyzeSkillGap as geminiAnalyzeSkillGap } from "./gemini.js";
import { SkillGapAnalysis } from "../models/skillGapSchema.js";

export const calculateProgressMetrics = (analysis: Partial<SkillGapAnalysis>): number => {
  if (!analysis.roadmap || analysis.roadmap.length === 0) {
    return analysis.matchPercentage || 0;
  }

  const completedItems = analysis.roadmap.filter((item) => item.completed).length;
  const totalItems = analysis.roadmap.length;
  
  const completionRatio = completedItems / totalItems;
  
  // If matchPercentage is 60, and there are 4 items, each item is worth (100 - 60) / 4 = 10%.
  // So progress = matchPercentage + (completionRatio * (100 - matchPercentage))
  const baseMatch = analysis.matchPercentage || 0;
  const progress = baseMatch + (completionRatio * (100 - baseMatch));
  
  return Math.round(progress);
};

export const analyzeSkillGap = async (profile: any, opportunity: any): Promise<Partial<SkillGapAnalysis>> => {
  // Format profile into a resume text string for the AI
  const resumeText = `
Name: ${profile.name || "Student"}
Field: ${profile.field || "Not specified"}
College: ${profile.college || "Not specified"}
Year: ${profile.year || "Not specified"}
Skills: ${profile.skills?.join(", ") || "None listed"}
Experience: ${JSON.stringify(profile.experience || [])}
Education: ${JSON.stringify(profile.education || [])}
Projects: ${JSON.stringify(profile.projects || [])}
  `.trim();

  // Format opportunity into a job description string
  const jobDescription = `
Title: ${opportunity.title || "Opportunity"}
Organization: ${opportunity.organization || opportunity.company || "Unknown"}
Type: ${opportunity.type || opportunity.category || "Unknown"}
Description: ${opportunity.description || ""}
Tags/Requirements: ${opportunity.tags?.join(", ") || opportunity.requirements?.join(", ") || "None"}
  `.trim();

  // Call the gemini AI service
  const aiResult = await geminiAnalyzeSkillGap(resumeText, jobDescription);
  
  return {
    ...aiResult,
    userId: profile.uid || profile._id?.toString(),
    opportunityId: opportunity._id?.toString() || opportunity.id,
    opportunityTitle: opportunity.title,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};
