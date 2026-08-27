import { z } from "zod";

export const NotificationPreferenceSchema = z.enum([
  "in_app",
  "email",
  "both",
  "none",
]);

export const SavedSearchSchema = z.object({
  userId: z.string().trim().min(1).optional(), // Optional because it might be added by middleware
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters long")
    .max(100),
  filters: z.object({
    query: z.string().trim().max(100).optional(),
    types: z.array(z.string().trim()).max(20).default([]),
    tags: z.array(z.string().trim()).max(20).default([]),
    location: z.string().trim().max(100).optional(),
    deadlineAfter: z.coerce.date().optional(),
    remoteOnly: z.boolean().default(false),
  }),
  notificationPreference: NotificationPreferenceSchema.default("in_app"),
  isActive: z.boolean().default(true),
  lastMatchedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type SavedSearchInput = z.infer<typeof SavedSearchSchema>;
