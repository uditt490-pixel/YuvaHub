import { z } from "zod";

export const CompanyBoothSchema = z.object({
  id: z.string().optional(),
  fairId: z.string(),
  companyName: z.string().min(1),
  description: z.string(),
  openRoles: z.array(z.string()),
  recruitersOnline: z.number().default(0),
});

export type ICompanyBooth = z.infer<typeof CompanyBoothSchema>;

export const VirtualCareerFairSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  organizer: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  status: z.enum(['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
  booths: z.array(CompanyBoothSchema).optional().default([]),
});

export type IVirtualCareerFair = z.infer<typeof VirtualCareerFairSchema>;
