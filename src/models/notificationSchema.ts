import { z } from "zod";

export const NotificationTypeSchema = z.enum([
  "skill_match",
  "deadline_reminder",
  "new_opportunity",
  "scholarship_alert",
  "hackathon_alert",
  "welcome"
]);

export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationSchema = z.object({
  userId: z.string(), // UID of the recipient user (or 'global-subscribers' for broadcasts)
  type: NotificationTypeSchema,
  title: z.string(),
  message: z.string(),
  targetId: z.string().optional(), // ID of matching opportunity/scholarship
  read: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
});

export type Notification = z.infer<typeof NotificationSchema>;
