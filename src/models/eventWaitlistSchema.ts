import { z } from "zod";

export const WaitlistStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
]);

export type WaitlistStatus = z.infer<typeof WaitlistStatusSchema>;

export const EventWaitlistSchema = z.object({
  opportunityId: z.string(),
  userId: z.string(),
  status: WaitlistStatusSchema.default("pending"),
  joinedAt: z.date().default(() => new Date()),
  notified: z.boolean().default(false),
  updatedAt: z.date().default(() => new Date()),
});

export type EventWaitlist = z.infer<typeof EventWaitlistSchema>;

export interface EventWaitlistDocument {
  _id?: string;
  
  /**
   * Opportunity / Event ID
   */
  opportunityId: string;
  
  /**
   * User ID of the waitlisted member
   */
  userId: string;
  
  /**
   * Current workflow state
   */
  status: WaitlistStatus;
  
  /**
   * Whether the user has been notified of approval
   */
  notified: boolean;
  
  joinedAt: Date;
  updatedAt: Date;
}

/**
 * Factory helper
 * Creates a clean event waitlist document
 */
export function createEventWaitlistDocument(
  data: Partial<EventWaitlistDocument>
): EventWaitlistDocument {
  const now = new Date();
  
  return {
    opportunityId: data.opportunityId || "",
    userId: data.userId || "",
    status: data.status || "pending",
    notified: data.notified || false,
    joinedAt: data.joinedAt || now,
    updatedAt: data.updatedAt || now,
  };
}
