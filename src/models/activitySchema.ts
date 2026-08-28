import { z } from "zod";

export const ActivityTypeEnum = z.enum([
  "bounty_posted",
  "bounty_accepted",
  "bounty_resolved",
  "code_review_requested",
  "code_review_claimed",
  "code_review_completed",
  "karma_earned",
  "karma_spent"
]);

export const ActivityEventSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  type: ActivityTypeEnum,
  entityId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  points: z.number().optional(),
  createdAt: z.number().default(() => Date.now()),
});

export type ActivityEvent = z.input<typeof ActivityEventSchema>;

export const DigestPreferenceSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  frequency: z.enum(["Daily", "Weekly", "None"]),
  email: z.string().email().optional(),
  updatedAt: z.number().default(() => Date.now()),
});

export type DigestPreference = z.input<typeof DigestPreferenceSchema>;
