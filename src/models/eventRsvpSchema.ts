import { z } from 'zod';

export const EventRsvpStatus = z.enum([
    'registered',
    'waitlisted',
    'confirmed',
    'cancelled',
    'checked_in'
]);

export const eventRsvpSchema = z.object({
    id: z.string().optional(),
    eventId: z.string().min(1, "Event ID is required"),
    userId: z.string().min(1, "User ID is required"),
    status: EventRsvpStatus.default('registered'),
    waitlistPosition: z.number().int().nonnegative().optional(),
    notes: z.string().optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});

export type EventRsvpStatusType = z.infer<typeof EventRsvpStatus>;
export type EventRsvp = z.infer<typeof eventRsvpSchema>;
