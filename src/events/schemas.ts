import { z } from 'zod';

export const EventType = z.enum([
  'OpportunityScraped',
  'UserRegistered',
  'ApplicationSubmitted'
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
export type EventPayloads = OpportunityScrapedEvent;
