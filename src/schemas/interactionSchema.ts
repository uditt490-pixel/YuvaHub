import { z } from "zod";

export const interactionTrackSchema = z.object({
  opportunity_id: z.string().min(1),
  action: z.enum(["click", "view", "apply", "save", "share"]),
  metadata: z.record(z.string(), z.any()).optional()
});
