import { z } from "zod";

export const PointTransactionSchema = z.object({
  _id: z.string().optional(),
  userId: z.string().min(1),
  amount: z.number().int(),
  actionType: z.enum([
    "create_post",
    "reply_forum",
    "share_resource",
    "review_resume",
    "upvote_received",
    "gig_escrow",
    "gig_payout",
    "other",
  ]),
  timestamp: z.coerce.date(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type PointTransaction = z.infer<typeof PointTransactionSchema>;
