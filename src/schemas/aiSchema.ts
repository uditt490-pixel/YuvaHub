import { z } from "zod";

export const aiGenerateSchema = z.object({
  prompt: z.string().min(1).max(10000, "Prompt must be less than 10,000 characters"),
  context: z.string().max(10000).optional(),
  config: z.object({
    temperature: z.number().min(0).max(1).optional(),
    maxTokens: z.number().min(1).max(2048).optional(),
    model: z.string().optional()
  }).optional()
});

export const aiResumeReviewSchema = z.object({
  resumeText: z.string().min(1).max(20000, "Resume text must be less than 20,000 characters"),
  jobDescription: z.string().max(10000).optional()
});

export const aiCoverLetterSchema = z.object({
  resumeText: z.string().min(1).max(20000),
  jobDescription: z.string().min(1).max(10000),
  companyName: z.string().min(1).max(200),
  roleTitle: z.string().min(1).max(200)
});
