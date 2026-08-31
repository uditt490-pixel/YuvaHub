import { z } from "zod";

export const analyticsTrackSchema = z.object({
  event: z.string().min(1).max(100),
  timestamp: z.string().datetime().optional(),
  userId: z.string().optional(),
  properties: z.record(z.string(), z.any()).optional()
}).or(z.array(z.object({
  event: z.string().min(1).max(100),
  timestamp: z.string().datetime().optional(),
  userId: z.string().optional(),
  properties: z.record(z.string(), z.any()).optional()
})));
