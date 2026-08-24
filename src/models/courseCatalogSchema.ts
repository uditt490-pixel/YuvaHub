import { z } from "zod";

export const CourseCatalogSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  credits: z.number().int().min(1),
  description: z.string().optional(),
  prerequisites: z.array(z.string()).default([]), // array of course IDs
  corequisites: z.array(z.string()).default([]),
  termsOffered: z.array(z.enum(["Fall", "Spring", "Summer"])).default(["Fall", "Spring"])
});

export type CourseCatalog = z.infer<typeof CourseCatalogSchema>;
