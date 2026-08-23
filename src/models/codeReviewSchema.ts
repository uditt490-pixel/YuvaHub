import { z } from "zod";

export const CodeReviewRequestSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(2000),
  language: z.string().trim().min(1, "Language is required"),
  prUrl: z.string().url().optional().or(z.literal("")),
  codeSnippet: z.string().max(10000).optional(),
  tags: z.array(z.string().trim()).max(5).default([]),
  requesterId: z.string().trim().min(1),
  requesterName: z.string().trim().min(1),
  status: z.enum(["open", "in_review", "completed"]).default("open"),
  reviewerId: z.string().optional(),
  reviewerName: z.string().optional(),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional()
}).refine(data => data.prUrl || data.codeSnippet, {
  message: "Either a PR URL or a Code Snippet must be provided",
  path: ["prUrl"]
});

export type CodeReviewRequestInput = z.infer<typeof CodeReviewRequestSchema>;

export const CodeReviewFeedbackSchema = z.object({
  requestId: z.string().trim().min(1),
  reviewerId: z.string().trim().min(1),
  correctnessScore: z.number().min(1).max(5),
  readabilityScore: z.number().min(1).max(5),
  bestPracticesScore: z.number().min(1).max(5),
  comments: z.string().trim().min(10, "Comments must be at least 10 characters").max(5000),
  suggestedChanges: z.string().max(10000).optional(),
  createdAt: z.number().optional()
});

export type CodeReviewFeedbackInput = z.infer<typeof CodeReviewFeedbackSchema>;
