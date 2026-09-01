import { z } from "zod";

export const MilestoneSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  dueDate: z.coerce.date().optional(),
  status: z.enum(["not_started", "in_progress", "completed"]).default("not_started"),
  completedAt: z.coerce.date().optional(),
  linkedOpportunityId: z.string().optional(),
});

export type Milestone = z.infer<typeof MilestoneSchema>;

export const CareerGoalSchema = z.object({
  _id: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
  goalTitle: z.string().min(1, "Goal Title is required"),
  targetRole: z.string().min(1, "Target Role is required"),
  targetDate: z.coerce.date(),
  status: z.enum(["active", "achieved", "abandoned"]).default("active"),
  milestones: z.array(MilestoneSchema).default([]),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

export type CareerGoal = z.infer<typeof CareerGoalSchema>;
