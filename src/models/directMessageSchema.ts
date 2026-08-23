import { z } from "zod";

export const DirectMessageSchema = z.object({
  senderId: z.string().trim().min(1),
  recipientId: z.string().trim().min(1),
  content: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message cannot exceed 2000 characters"),
  readAt: z.coerce.date().nullable().default(null),
  createdAt: z.coerce.date().default(() => new Date()),
});

export type DirectMessage = z.infer<typeof DirectMessageSchema> & {
  _id?: string;
  id?: string;
};

export const ConversationSchema = z.object({
  participants: z.array(z.string().trim()).length(2),
  lastMessage: DirectMessageSchema.optional(),
  unreadCounts: z.record(z.string(), z.number().int().nonnegative()).default({}),
  updatedAt: z.coerce.date().default(() => new Date()),
});

export type Conversation = z.infer<typeof ConversationSchema> & {
  _id?: string;
  id?: string;
};
