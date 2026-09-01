import { z } from "zod";

export const SkillGapItemSchema = z.object({
  skill: z.string().min(1),
  category: z.enum(["technical", "soft"]),
  priority: z.enum(["high", "medium", "low"]),
  reason: z.string(),
  completed: z.boolean().default(false),
});

export type SkillGapItem = z.infer<typeof SkillGapItemSchema>;

export const LearningRoadmapItemSchema = z.object({
  skill: z.string().min(1),
  priority: z.enum(["high", "medium", "low"]),
  estimatedWeeks: z.number().min(0),
  resources: z.array(z.string()),
  project: z.string(),
  completed: z.boolean().default(false),
});

export type LearningRoadmapItem = z.infer<typeof LearningRoadmapItemSchema>;

export const SkillGapAnalysisSchema = z.object({
  _id: z.string().optional(),
  userId: z.string().min(1),
  opportunityId: z.string().optional(),
  opportunityTitle: z.string().optional(),

  matchPercentage: z.number().min(0).max(100),

  existingSkills: z.array(z.string()),
  missingSkills: z.array(SkillGapItemSchema),

  roadmap: z.array(LearningRoadmapItemSchema),

  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

export type SkillGapAnalysis = z.infer<typeof SkillGapAnalysisSchema>;

export const AnalyzeSkillGapInputSchema = z.object({
  opportunityId: z.string().optional(),
  opportunityDescription: z.string().optional(),
});