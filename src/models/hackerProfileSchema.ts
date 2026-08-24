import { z } from "zod";

const SkillSchema = z.string().trim().min(1).max(60);

export const HackerProfileSchema = z.object({
  uid: z.string().trim().min(1).max(160),
  name: z.string().trim().min(1).max(120),
  skills: z.array(SkillSchema).max(20).default([]),
  timezone: z.string().trim().max(100).optional(),
  hackathonInterests: z.array(z.string().trim().max(100)).max(20).default([]),
  location: z
    .object({
      type: z.literal("Point"),
      coordinates: z.tuple([z.number(), z.number()]), // [longitude, latitude]
    })
    .optional(),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

export type HackerProfile = z.infer<typeof HackerProfileSchema> & {
  _id?: string;
  id?: string;
};

export const CreateHackerProfileInputSchema = HackerProfileSchema.omit({
  uid: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateHackerProfileInput = z.infer<typeof CreateHackerProfileInputSchema>;
