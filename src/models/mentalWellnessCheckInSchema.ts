import { z } from "zod";

export const StressLevelSchema = z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']);
export type StressLevel = z.infer<typeof StressLevelSchema>;

export const PrimaryStressorSchema = z.enum(['ACADEMICS', 'EXAMS', 'JOB_HUNT', 'FINANCES', 'PERSONAL']);
export type PrimaryStressor = z.infer<typeof PrimaryStressorSchema>;

export const SessionStatusSchema = z.enum(['PENDING', 'SCHEDULED', 'COMPLETED', 'RESOLVED']);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const MentalWellnessCheckInSchema = z.object({
  studentId: z.string().min(1),
  studentName: z.string().min(1),
  campusName: z.string().min(1),
  moodRating: z.number().min(1).max(5),
  stressLevel: StressLevelSchema.default('MODERATE'),
  burnoutScorePercent: z.number().min(0).max(100),
  primaryStressor: PrimaryStressorSchema.default('ACADEMICS'),
  supportRequested: z.boolean().default(false),
  counselorAssigned: z.string().optional(),
  sessionStatus: SessionStatusSchema.default('PENDING'),
  confidentialNotes: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type IMentalWellnessCheckIn = z.infer<typeof MentalWellnessCheckInSchema>;
