import { z } from "zod";

export const createPostSchema = z.object({
  content: z.string().min(1).max(5000),
  tags: z.array(z.string().max(50)).max(10).optional(),
  mediaUrls: z.array(z.string().url()).max(5).optional()
});

export const commentPostSchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().optional()
});

export const upvotePostSchema = z.object({
  value: z.number().int().min(-1).max(1).default(1)
});
