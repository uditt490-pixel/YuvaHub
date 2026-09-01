import { z } from "zod";

export const DeliverableStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
]);

export const GigDeliverableSchema = z.object({
  gigId: z.string().trim().min(1, "Gig ID is required"),
  studentId: z.string().trim().min(1, "Student ID is required"),
  contentUrl: z.string().url("Must be a valid URL").optional(),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
  status: DeliverableStatusSchema.default("pending"),
  submittedAt: z.coerce.date().optional(),
});

export type GigDeliverableInput = z.infer<typeof GigDeliverableSchema>;
