import { z } from "zod";

export const WatchlistFrequencySchema = z.enum([
  "immediate",
  "daily",
  "weekly",
]);

export const WatchlistNotifyViaSchema = z.enum([
  "email",
  "push",
  "both",
]);

export const WatchlistRuleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters long")
    .max(100),
  filters: z.object({
    keywords: z.array(z.string().trim().min(1).max(50)).max(10).default([]),
    categories: z.array(z.string().trim().min(1).max(50)).max(10).default([]),
    location: z.string().trim().max(100).optional(),
    minStipend: z.number().nonnegative().optional(),
  }),
  notifyVia: WatchlistNotifyViaSchema.default("push"),
  frequency: WatchlistFrequencySchema.default("immediate"),
  userId: z.string().trim().min(1).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type WatchlistRuleInput = z.infer<typeof WatchlistRuleSchema>;
