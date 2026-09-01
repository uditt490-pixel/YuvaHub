import { z } from "zod";

export const ExpertiseAreaSchema = z.enum([
  'SOFTWARE_ENGINEERING',
  'PRODUCT_MANAGEMENT',
  'AI_RESEARCH',
  'VENTURE_CAPITAL'
]);
export type ExpertiseArea = z.infer<typeof ExpertiseAreaSchema>;

export const MentorshipStatusSchema = z.enum(['OPEN', 'BOOKED', 'COMPLETED', 'CANCELLED']);
export type MentorshipStatus = z.infer<typeof MentorshipStatusSchema>;

export const AlumniMentorshipSlotSchema = z.object({
  slotId: z.string().optional(),
  mentorName: z.string().min(1),
  mentorAlumniBatchYear: z.number(),
  mentorCurrentCompany: z.string().min(1),
  mentorCurrentRole: z.string().min(1),
  campusName: z.string().min(1),
  expertiseArea: ExpertiseAreaSchema.default('SOFTWARE_ENGINEERING'),
  availableSessionsCount: z.number().min(1),
  sessionDurationMinutes: z.number().default(45),
  matchingCompatibilityPercent: z.number().min(0).max(100).default(95),
  status: MentorshipStatusSchema.default('OPEN'),
  assignedStudentId: z.string().optional(),
  assignedStudentName: z.string().optional(),
  sessionTopics: z.string().min(1),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type IAlumniMentorshipSlot = z.infer<typeof AlumniMentorshipSlotSchema>;
