import { z } from "zod";

export const reportOpportunitySchema = z.object({
  reason: z.string().min(1).max(500),
  details: z.string().max(2000).optional(),
  contactEmail: z.string().email().optional()
});
