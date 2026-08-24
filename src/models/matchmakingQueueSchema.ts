import { z } from "zod";

export const MatchmakingQueueStatusSchema = z.enum([
  "waiting",
  "matched",
  "timed_out",
]);

export type MatchmakingQueueStatus = z.infer<
  typeof MatchmakingQueueStatusSchema
>;

export const MatchmakingQueueDocumentSchema = z.object({
  _id: z.string().optional(),
  userId: z.string().trim().min(1),
  targetRole: z.string().trim().min(1),
  experienceLevel: z.string().trim().optional(),
  status: MatchmakingQueueStatusSchema.default("waiting"),
  joinedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type MatchmakingQueueDocument = z.infer<
  typeof MatchmakingQueueDocumentSchema
>;

export function createMatchmakingQueueDocument(
  data: Partial<MatchmakingQueueDocument>,
): MatchmakingQueueDocument {
  const now = new Date();
  return MatchmakingQueueDocumentSchema.parse({
    userId: data.userId ?? "",
    targetRole: data.targetRole ?? "",
    experienceLevel: data.experienceLevel,
    status: data.status ?? "waiting",
    joinedAt: data.joinedAt ?? now,
    updatedAt: data.updatedAt ?? now,
  });
}
