import { z } from "zod";

export const IncubationStageSchema = z.enum([
  "Ideation",
  "Prototype",
  "MVP Built",
  "Early Traction",
  "Scale Phase",
  "Graduated"
]);
export type IncubationStage = z.infer<typeof IncubationStageSchema>;

export const VentureMilestoneSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  description: z.string().min(5),
  targetDate: z.string(),
  fundingAllocation: z.number().default(0),
  status: z.enum(["Pending", "In Progress", "Completed", "Verified"]).default("Pending"),
  deliverables: z.array(z.string()).default([])
});
export type VentureMilestone = z.infer<typeof VentureMilestoneSchema>;

export const ProjectIncubationSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Project title must be at least 3 characters"),
  tagline: z.string().min(10, "Tagline must be at least 10 characters"),
  problemStatement: z.string().min(20),
  solutionOverview: z.string().min(20),
  targetMarket: z.string().min(5),
  category: z.enum([
    "AI & Machine Learning",
    "EdTech & Student Productivity",
    "FinTech & Web3",
    "HealthTech & BioTech",
    "CleanTech & Sustainability",
    "Developer Tools & SaaS"
  ]),
  stage: IncubationStageSchema.default("Ideation"),
  teamMembers: z.array(z.object({
    name: z.string(),
    role: z.string(),
    email: z.string().email().optional(),
    githubOrLinkedin: z.string().optional()
  })).default([]),
  equitySplit: z.record(z.string(), z.number()).optional(),
  fundingRequestedINR: z.number().min(0).default(50000),
  valuationINR: z.number().min(0).default(500000),
  aiFeasibilityScore: z.number().min(0).max(100).default(85),
  aiTractionScore: z.number().min(0).max(100).default(78),
  aiMarketScore: z.number().min(0).max(100).default(82),
  milestones: z.array(VentureMilestoneSchema).default([]),
  pitchDeckSlideCount: z.number().default(10),
  demoVideoUrl: z.string().url().optional(),
  githubRepoUrl: z.string().url().optional(),
  mentorAssigned: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

export type ProjectIncubation = z.infer<typeof ProjectIncubationSchema>;

export const AIVentureEvaluationSchema = z.object({
  overallViabilityScore: z.number().min(0).max(100),
  feasibilityRating: z.string(),
  marketOpportunityRating: z.string(),
  keyStrengths: z.array(z.string()),
  riskFactors: z.array(z.string()),
  suggestedPivots: z.array(z.string()),
  grantEligibilityScore: z.number().min(0).max(100),
  recommendedFundingTierINR: z.number()
});

export type AIVentureEvaluation = z.infer<typeof AIVentureEvaluationSchema>;
