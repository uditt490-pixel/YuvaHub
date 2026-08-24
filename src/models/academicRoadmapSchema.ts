import { z } from "zod";

export const SemesterSchema = z.object({
  id: z.string(), // e.g., "semester-fall-2026"
  term: z.enum(["Fall", "Spring", "Summer"]),
  year: z.number().int(),
  courseIds: z.array(z.string()).default([])
});

export const AcademicRoadmapSchema = z.object({
  userId: z.string(),
  semesters: z.array(SemesterSchema).default([]),
  totalCreditsPlanned: z.number().int().default(0),
  graduationRequirementCredits: z.number().int().default(120), // default to 120 credits for graduation
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date())
});

export type Semester = z.infer<typeof SemesterSchema>;
export type AcademicRoadmap = z.infer<typeof AcademicRoadmapSchema>;
