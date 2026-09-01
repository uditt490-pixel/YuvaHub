import { z } from "zod";

export const FundCategorySchema = z.enum([
  'RESEARCH_GRANT',
  'STUDENT_SCHOLARSHIP',
  'LAB_EQUIPMENT',
  'HACKATHON_SPONSORSHIP'
]);
export type FundCategory = z.infer<typeof FundCategorySchema>;

export const GrantStatusSchema = z.enum(['ACTIVE', 'FULLY_FUNDED', 'DISBURSED', 'PAUSED']);
export type GrantStatus = z.infer<typeof GrantStatusSchema>;

export const AlumniEndowmentFundSchema = z.object({
  fundId: z.string().optional(),
  fundName: z.string().min(1),
  campusName: z.string().min(1),
  donorName: z.string().min(1),
  donorAlumniBatchYear: z.number(),
  fundCategory: FundCategorySchema.default('STUDENT_SCHOLARSHIP'),
  targetAmountUsd: z.number().min(100),
  currentAmountRaisedUsd: z.number().min(0).default(0),
  totalDonorsCount: z.number().min(0).default(1),
  grantStatus: GrantStatusSchema.default('ACTIVE'),
  matchingGrantEnabled: z.boolean().default(false),
  matchingRatio: z.number().default(1.0),
  description: z.string().min(1),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type IAlumniEndowmentFund = z.infer<typeof AlumniEndowmentFundSchema>;
