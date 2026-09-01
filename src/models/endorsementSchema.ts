import { z } from "zod";

export const EndorsementSchema = z.object({
  _id: z.string().optional(),
  endorserUid: z.string().min(1),
  targetUid: z.string().min(1),
  skill: z.string().min(1),
  timestamp: z.coerce.date(),
});

export type Endorsement = z.infer<typeof EndorsementSchema>;
