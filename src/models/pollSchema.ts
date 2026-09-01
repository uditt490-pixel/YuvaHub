import { z } from "zod";

export const PollOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1).max(200),
  votes: z.number().int().min(0).default(0)
});

export const PollSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  question: z.string().min(5).max(500),
  options: z.array(PollOptionSchema).min(2).max(10),
  allowMultipleVotes: z.boolean().default(false),
  expiresAt: z.coerce.date().nullable().optional(),
  authorUid: z.string().trim().min(1),
  authorName: z.string().trim().min(1),
  voters: z.array(z.string()).default([]),
  status: z.enum(["active", "closed"]).default("active"),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

export type PollOption = z.infer<typeof PollOptionSchema>;
export type PollDocument = z.infer<typeof PollSchema>;
