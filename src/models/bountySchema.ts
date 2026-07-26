import { z } from "zod";

export const BountyStatusSchema = z.enum([
  "open",
  "accepted",
  "resolved",
  "cancelled",
]);

export const BountySchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters long")
    .max(140),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters long")
    .max(5000),
  tags: z
    .array(z.string().trim().min(1).max(40))
    .max(15)
    .default([]),
  reward: z
    .number()
    .finite()
    .min(1, "Reward must be positive")
    .max(10_000_000, "Reward exceeds the supported maximum"),
  posterName: z.string().trim().min(1).max(120),
  createdBy: z.string().trim().min(1).optional(),
  status: BountyStatusSchema.default("open"),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type BountyInput = z.infer<typeof BountySchema>;
