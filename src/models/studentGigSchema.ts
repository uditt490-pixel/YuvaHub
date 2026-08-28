import { z } from "zod";

export const GigStatusSchema = z.enum([
  "open",
  "in_progress",
  "completed",
  "cancelled",
]);

export const StudentGigSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(140),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(5000),
  rewardPoints: z.number().int().positive("Reward points must be positive"),
  posterId: z.string().trim().min(1, "Poster ID is required"),
  status: GigStatusSchema.default("open"),
  selectedStudentId: z.string().trim().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type StudentGigInput = z.infer<typeof StudentGigSchema>;
