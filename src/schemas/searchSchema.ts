import { z } from "zod";

export const escapeRegex = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200).optional().transform(val => val ? escapeRegex(val) : val),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional()
});

export const opportunityQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
  type: z.string().max(50).optional(),
  location: z.string().max(100).optional()
});
