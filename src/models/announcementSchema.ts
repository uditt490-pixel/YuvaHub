import { z } from "zod";

export const AnnouncementPriorityEnum = z.enum(["low", "normal", "high", "critical"]);
export const AnnouncementCategoryEnum = z.enum(["update", "feature", "maintenance", "event"]);

export const AnnouncementSchema = z.object({
  id: z.string().optional(), // Can be optional on creation
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"), // Markdown supported
  category: AnnouncementCategoryEnum,
  priority: AnnouncementPriorityEnum,
  publishedAt: z.number().default(() => Date.now()),
  expiresAt: z.number().optional(), // Nullable expiry for permanent announcements
  author: z.string().min(1, "Author is required"),
  isPinned: z.boolean().default(false),
  targetAudience: z.array(z.string()).default(["all"]),
  dismissedBy: z.array(z.string()).default([]), // Array of user IDs who dismissed this
  viewCount: z.number().default(0),
});

export type Announcement = z.input<typeof AnnouncementSchema>;
