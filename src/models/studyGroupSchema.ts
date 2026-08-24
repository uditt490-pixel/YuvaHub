import { z } from "zod";

const TagSchema = z.string().trim().min(1).max(40);

export const StudyGroupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  topic: z.string().trim().min(2, "Topic must be at least 2 characters").max(120),
  tags: z.array(TagSchema).max(10).default([]),
  maxCapacity: z.number().int().min(2, "Capacity must be at least 2").max(100, "Capacity max 100").default(10),
  createdBy: z.string().trim().min(1), // uid
  resourceUrl: z.string().url().max(500).optional().or(z.literal("")),
  members: z.array(z.string().trim().min(1)).default([]), // array of uids
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

export type StudyGroup = z.infer<typeof StudyGroupSchema> & {
  _id?: string;
  id?: string;
};

export const CreateStudyGroupInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  topic: z.string().trim().min(2).max(120),
  tags: z.array(TagSchema).max(10).default([]),
  maxCapacity: z.number().int().min(2).max(100).default(10),
  resourceUrl: z.string().url().max(500).optional().or(z.literal("")),
});

export type CreateStudyGroupInput = z.infer<typeof CreateStudyGroupInputSchema>;
