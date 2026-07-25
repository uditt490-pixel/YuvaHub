import { z } from "zod";

export const BountySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().min(20, "Description must be at least 20 characters long"),
  tags: z.array(z.string()).default([]),
  reward: z.number().positive("Reward must be positive"),
  posterName: z.string().min(1, "Poster name is required"),
});
