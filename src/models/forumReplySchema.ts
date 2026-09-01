import { z } from "zod";

export const ForumReplySchema = z.object({
  postId: z.string(),
  parentReplyId: z.string().optional().nullable(),
  authorName: z.string(),
  authorUid: z.string(),
  content: z.string().min(1, "Reply cannot be empty"),
  upvotes: z.number().int().default(0),
  upvotedBy: z.array(z.string()).default([]),
  isAcceptedAnswer: z.boolean().default(false),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date())
});

export type ForumReply = z.infer<typeof ForumReplySchema>;
