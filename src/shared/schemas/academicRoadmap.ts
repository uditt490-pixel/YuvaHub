import { z } from 'zod';

export const CourseSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  credits: z.number().min(1),
  department: z.string(),
  prerequisites: z.array(z.string()).default([]), // Array of course IDs
  corequisites: z.array(z.string()).default([]),
});

export const SemesterPlanSchema = z.object({
  id: z.string(),
  name: z.string(), // e.g. "Fall 2026"
  year: z.number(),
  order: z.number(), // Chronological index (1 to 8)
  courses: z.array(CourseSchema),
});

export const AcademicRoadmapSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  degreeName: z.string(),
  requiredCredits: z.number().default(120),
  semesters: z.array(SemesterPlanSchema),
});

export type Course = z.infer<typeof CourseSchema>;
export type SemesterPlan = z.infer<typeof SemesterPlanSchema>;
export type AcademicRoadmap = z.infer<typeof AcademicRoadmapSchema>;
