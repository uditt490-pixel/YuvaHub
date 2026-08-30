import { z } from "zod";

export const OpportunityReportReasonEnum = z.enum([
  "expired",
  "fraudulent",
  "duplicate",
  "other",
]);

export const OpportunityReportStatusEnum = z.enum([
  "pending",
  "resolved",
  "dismissed",
]);

export const OpportunityReportSchema = z.object({
  opportunityId: z.string().trim().min(1),
  reporterUid: z.string().trim().min(1),
  reason: OpportunityReportReasonEnum,
  evidence: z.string().trim().max(1000).optional(),
  status: OpportunityReportStatusEnum.default("pending"),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

export type OpportunityReport = z.infer<typeof OpportunityReportSchema> & {
  _id?: string;
  id?: string;
};
