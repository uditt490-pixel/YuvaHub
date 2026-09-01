import { z } from "zod";

export const ReportReasonEnum = z.enum(["Spam", "Scam", "Inappropriate", "Harassment", "Other"]);
export const ReportStatusEnum = z.enum(["pending", "resolved", "dismissed"]);
export const AdminActionEnum = z.enum(["remove", "ban", "warn", "none"]);

export const ReportSchema = z.object({
  contentType: z.enum(["opportunity", "post", "team", "user"]),
  contentId: z.string().trim().min(1),
  reporterUid: z.string().trim().min(1),
  reason: ReportReasonEnum,
  description: z.string().trim().max(1000).optional(),
  status: ReportStatusEnum.default("pending"),
  adminAction: AdminActionEnum.default("none"),
  contentSnapshot: z.any().optional(), // Stores the state of the content when reported
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

export type Report = z.infer<typeof ReportSchema> & { _id?: string; id?: string };
