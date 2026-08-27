import { z } from "zod";

export const NotificationTypeSchema = z.enum([
  "skill_match",
  "deadline_reminder",
  "new_opportunity",
  "scholarship_alert",
  "hackathon_alert",
  "welcome",
]);

export type NotificationType = z.infer<
  typeof NotificationTypeSchema
>;

const defaultExpiry = () =>
  new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

export const NotificationSchema = z.object({
  userId: z.string().trim().min(1).max(160),
  type: NotificationTypeSchema,
  title: z.string().trim().min(1).max(180),
  message: z.string().trim().min(1).max(2000),
  targetId: z.string().trim().max(160).optional(),
  /**
   * Stable, process-independent key for deadline reminder deduplication.
   * It is intentionally optional so legacy notifications remain valid.
   */
  dedupeKey: z.string().trim().min(1).max(400).optional(),
  read: z.boolean().default(false),
  createdAt: z.coerce.date().default(() => new Date()),
  expiresAt: z.coerce.date().default(defaultExpiry),
});

export type Notification = z.infer<
  typeof NotificationSchema
>;
