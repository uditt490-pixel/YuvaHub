import { z } from "zod";

export const testimonialSchema = z.object({
  id: z.string().optional(),
  authorId: z.string(),
  recipientId: z.string(),
  authorName: z.string().optional(),
  authorAvatarUrl: z.string().optional(),
  authorCollege: z.string().optional(),
  relationship: z.enum(["peer", "mentor", "mentee", "manager", "teammate", "other"]),
  content: z.string().min(50).max(1500),
  skills: z.array(z.string()).max(5).optional(),
  status: z.enum(["pending", "approved", "rejected", "hidden"]).default("pending"),
  isHighlighted: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Testimonial = z.infer<typeof testimonialSchema>;
