import { z } from "zod";

export const SectorDomainSchema = z.enum([
  'FINTECH',
  'HEALTH_TECH',
  'ED_TECH',
  'SAAS',
  'HARDWARE'
]);
export type SectorDomain = z.infer<typeof SectorDomainSchema>;

export const FundingStageSchema = z.enum(['PRE_SEED', 'SEED', 'SERIES_A', 'STUDENT_GRANT']);
export type FundingStage = z.infer<typeof FundingStageSchema>;

export const InvestmentStatusSchema = z.enum(['OPEN', 'DUE_DILIGENCE', 'FULLY_COMMITTED', 'DISBURSED']);
export type InvestmentStatus = z.infer<typeof InvestmentStatusSchema>;

export const StudentVentureFundSchema = z.object({
  ventureId: z.string().optional(),
  startupName: z.string().min(1),
  campusName: z.string().min(1),
  studentFounderName: z.string().min(1),
  sectorDomain: SectorDomainSchema.default('SAAS'),
  fundingStage: FundingStageSchema.default('PRE_SEED'),
  targetInvestmentUsd: z.number().min(1000),
  committedInvestmentUsd: z.number().min(0).default(0),
  investorCount: z.number().min(0).default(0),
  investmentStatus: InvestmentStatusSchema.default('OPEN'),
  pitchDeckUrl: z.string().default('#'),
  executiveSummary: z.string().min(1),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type IStudentVentureFund = z.infer<typeof StudentVentureFundSchema>;
