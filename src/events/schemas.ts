import { z } from 'zod';

export const EventType = z.enum([
  'OpportunityScraped',
  'UserRegistered',
  'ApplicationSubmitted',
  'SessionBooked',
  'SessionCompleted',
  'MentorApplicationSubmitted',
  'PollVoted',
  'PollClosed',
  'OpportunityExpired'
]);

export const BaseEventSchema = z.object({
  eventId: z.string().uuid(),
  timestamp: z.string().datetime(),
  eventType: EventType,
});

export const OpportunityScrapedPayloadSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  company: z.string(),
  description: z.string(),
  sourceName: z.string(),
  tags: z.array(z.string()).optional(),
  opportunityType: z.string(),
  deadline: z.string().nullable().optional(),
  location: z.string().optional(),
  dedupeHash: z.string(),
});

export const OpportunityScrapedEventSchema = BaseEventSchema.extend({
  eventType: z.literal(EventType.enum.OpportunityScraped),
  payload: OpportunityScrapedPayloadSchema,
});

export type OpportunityScrapedEvent = z.infer<typeof OpportunityScrapedEventSchema>;

export const SessionBookedPayloadSchema = z.object({
  sessionId: z.string(),
  mentorUid: z.string(),
  studentUid: z.string(),
  topic: z.string(),
  slotDateTime: z.string(),
});

export const SessionBookedEventSchema = BaseEventSchema.extend({
  eventType: z.literal(EventType.enum.SessionBooked),
  payload: SessionBookedPayloadSchema,
});

export type SessionBookedEvent = z.infer<typeof SessionBookedEventSchema>;

export const SessionCompletedPayloadSchema = SessionBookedPayloadSchema;

export const SessionCompletedEventSchema = BaseEventSchema.extend({
  eventType: z.literal(EventType.enum.SessionCompleted),
  payload: SessionCompletedPayloadSchema,
});

export type SessionCompletedEvent = z.infer<typeof SessionCompletedEventSchema>;

export const MentorApplicationSubmittedPayloadSchema = z.object({
  applicationId: z.string(),
  applicantUid: z.string(),
  name: z.string(),
});

export const MentorApplicationSubmittedEventSchema = BaseEventSchema.extend({
  eventType: z.literal(EventType.enum.MentorApplicationSubmitted),
  payload: MentorApplicationSubmittedPayloadSchema,
});

export type MentorApplicationSubmittedEvent = z.infer<typeof MentorApplicationSubmittedEventSchema>;

export const PollVotedPayloadSchema = z.object({
  pollId: z.string(),
  userId: z.string(),
  optionId: z.string(),
});

export const PollVotedEventSchema = BaseEventSchema.extend({
  eventType: z.literal(EventType.enum.PollVoted),
  payload: PollVotedPayloadSchema,
});

export type PollVotedEvent = z.infer<typeof PollVotedEventSchema>;

export const PollClosedPayloadSchema = z.object({
  pollId: z.string(),
});

export const PollClosedEventSchema = BaseEventSchema.extend({
  eventType: z.literal(EventType.enum.PollClosed),
  payload: PollClosedPayloadSchema,
});

export type PollClosedEvent = z.infer<typeof PollClosedEventSchema>;

export const OpportunityExpiredPayloadSchema = z.object({
  opportunityId: z.string(),
  title: z.string(),
});

export const OpportunityExpiredEventSchema = BaseEventSchema.extend({
  eventType: z.literal(EventType.enum.OpportunityExpired),
  payload: OpportunityExpiredPayloadSchema,
});

export type OpportunityExpiredEvent = z.infer<typeof OpportunityExpiredEventSchema>;

export type EventPayloads =
  | OpportunityScrapedEvent
  | SessionBookedEvent
  | SessionCompletedEvent
  | MentorApplicationSubmittedEvent
  | PollVotedEvent
  | PollClosedEvent
  | OpportunityExpiredEvent;
