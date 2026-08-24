import { z } from "zod";

export const ResourceTypeEnum = z.enum(["article", "video", "course", "repo", "cheatsheet", "tool", "other"]);
export const DifficultyEnum = z.enum(["beginner", "intermediate", "advanced", "all_levels"]);
export const StatusEnum = z.enum(["active", "flagged", "hidden"]);

export const resourceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  url: z.string().url("Must be a valid URL"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  resourceType: ResourceTypeEnum,
  skills: z.array(z.string()).min(1, "At least one skill tag is required").max(10),
  difficulty: DifficultyEnum,
});

export type Resource = z.infer<typeof resourceSchema> & {
  _id?: string;
  id?: string;
  submitterId: string;
  submitterName: string;
  upvotes: number;
  downvotes: number;
  voterIds: Record<string, 'up' | 'down'>;
  savedBy: string[];
  status: z.infer<typeof StatusEnum>;
  createdAt: number;
  updatedAt: number;
};
