import { z } from "zod";

export const TechnologyDomainSchema = z.enum([
  'ARTIFICIAL_INTELLIGENCE',
  'BIOTECH',
  'CLEANTECH',
  'QUANTUM',
  'SEMICONDUCTORS'
]);
export type TechnologyDomain = z.infer<typeof TechnologyDomainSchema>;

export const PatentStatusSchema = z.enum(['FILED', 'GRANTED', 'LICENSED', 'COMMERCIALIZED']);
export type PatentStatus = z.infer<typeof PatentStatusSchema>;

export const ResearchPatentIpSchema = z.object({
  patentId: z.string().optional(),
  patentTitle: z.string().min(1),
  campusName: z.string().min(1),
  leadInventorName: z.string().min(1),
  patentApplicationNumber: z.string().min(1),
  technologyDomain: TechnologyDomainSchema.default('ARTIFICIAL_INTELLIGENCE'),
  patentStatus: PatentStatusSchema.default('FILED'),
  licensingFeeUsd: z.number().min(0),
  royaltySharePercent: z.number().min(0).max(100).default(5.0),
  commercialPartnerAssigned: z.string().optional(),
  abstractDescription: z.string().min(1),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type IResearchPatentIp = z.infer<typeof ResearchPatentIpSchema>;
