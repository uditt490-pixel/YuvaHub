import { z } from "zod";

export const MockInterviewSessionStatusSchema = z.enum([
  "active",
  "completed",
  "cancelled",
]);

export type MockInterviewSessionStatus = z.infer<
  typeof MockInterviewSessionStatusSchema
>;

export const PeerFeedbackSchema = z.object({
  communicationScore: z.number().min(1).max(5).optional(),
  technicalScore: z.number().min(1).max(5).optional(),
  strengths: z.string().max(1000).optional(),
  areasToImprove: z.string().max(1000).optional(),
  submittedAt: z.coerce.date().optional(),
});

export type PeerFeedback = z.infer<typeof PeerFeedbackSchema>;

export const MockInterviewSessionDocumentSchema = z.object({
  _id: z.string().optional(),
  user1Id: z.string().trim().min(1),
  user2Id: z.string().trim().min(1),
  targetRole: z.string().trim().min(1),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional(),
  status: MockInterviewSessionStatusSchema.default("active"),
  feedbackUser1: PeerFeedbackSchema.optional(),
  feedbackUser2: PeerFeedbackSchema.optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type MockInterviewSessionDocument = z.infer<
  typeof MockInterviewSessionDocumentSchema
>;

export function createMockInterviewSessionDocument(
  data: Partial<MockInterviewSessionDocument>,
): MockInterviewSessionDocument {
  const now = new Date();
  return MockInterviewSessionDocumentSchema.parse({
    user1Id: data.user1Id ?? "",
    user2Id: data.user2Id ?? "",
    targetRole: data.targetRole ?? "",
    startTime: data.startTime ?? now,
    endTime: data.endTime,
    status: data.status ?? "active",
    feedbackUser1: data.feedbackUser1,
    feedbackUser2: data.feedbackUser2,
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now,
  });
}
