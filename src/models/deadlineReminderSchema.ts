import { z } from "zod";

export const DeadlineReminderSchema = z.object({
  userId: z.string().trim().min(1, "User ID is required"),
  opportunityId: z.string().trim().min(1, "Opportunity ID is required"),
  opportunityTitle: z.string().trim().min(1, "Opportunity Title is required"),
  deadlineDate: z.coerce.date(),
  reminderOffsets: z.array(z.number().int()).default([24, 48]), // Hours before deadline
  channels: z.array(z.enum(["email", "push"])).default(["email", "push"]),
  enabled: z.boolean().default(true),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date())
});

export type DeadlineReminder = z.infer<typeof DeadlineReminderSchema> & {
  _id?: any;
  id?: string;
};
