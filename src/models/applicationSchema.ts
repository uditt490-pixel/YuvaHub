import { z } from "zod";

export const ApplicationStatusSchema = z.enum([
  "draft",
  "saved",
  "interested",
  "applied",
  "pending_confirmation",
  "queued",
  "submitting",
  "submitted",
  "under_review",
  "interview",
  "interview_scheduled",
  "interviewing",
  "offer",
  "selected",
  "rejected",
  "failed",
  "retrying",
]);

export type ApplicationStatus = z.infer<
  typeof ApplicationStatusSchema
>;

export const ApplicationAuditActionSchema = z.enum([
  "CREATED",
  "CONFIRMED",
  "QUEUED",
  "SUBMISSION_STARTED",
  "SUBMITTED",
  "FAILED",
  "RETRY_TRIGGERED",
  "UPDATED",
]);

export const ApplicationAuditLogSchema = z.object({
  action: ApplicationAuditActionSchema,
  timestamp: z.coerce.date(),
  message: z.string().max(1000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ApplicationAuditLog = z.infer<
  typeof ApplicationAuditLogSchema
>;

export const ApplicationDocumentSchema = z.object({
  _id: z.string().optional(),
  userId: z.string().trim().min(1),
  opportunityId: z.string().trim().min(1),
  opportunity: z.object({
    title: z.string().trim().min(1),
    organization: z.string().trim().optional(),
    platform: z.string().trim().optional(),
    applyUrl: z.string().url().optional().or(z.literal("")),
    type: z.string().optional(),
    location: z.string().optional(),
    deadline: z.string().optional(),
  }),
  resume: z
    .object({
      name: z.string().trim().min(1),
      url: z.string().url(),
    })
    .optional(),
  coverLetter: z
    .object({
      template: z.string().trim().optional(),
      content: z.string().min(1).max(25000),
    })
    .optional(),
  platform: z.string().trim().min(1).default("unknown"),
  status: ApplicationStatusSchema.default("pending_confirmation"),
  notes: z.string().max(5000).optional(),
  deadline: z.coerce.date().optional(),
  retryCount: z.number().int().min(0).max(20).default(0),
  lastError: z.string().max(4000).optional(),
  externalApplicationId: z.string().trim().optional(),
  userConfirmed: z.boolean().default(false),
  auditLogs: z.array(ApplicationAuditLogSchema).max(200).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ApplicationDocument = z.infer<
  typeof ApplicationDocumentSchema
>;


/**
 * Factory helper
 * Creates a clean application document
 */

export function createApplicationDocument(
  data: Partial<ApplicationDocument>,
): ApplicationDocument {
  const now = new Date();

  return ApplicationDocumentSchema.parse({
    userId: data.userId ?? "",
    opportunityId: data.opportunityId ?? "",
    opportunity: data.opportunity ?? { title: "" },

    resume: data.resume,
    coverLetter: data.coverLetter,
    platform: data.platform ?? "unknown",
    status: data.status ?? "pending_confirmation",
    retryCount: data.retryCount ?? 0,
    lastError: data.lastError,
    externalApplicationId: data.externalApplicationId,
    userConfirmed: data.userConfirmed ?? false,
    auditLogs:
      data.auditLogs ??
      [
        {
          action: "CREATED",
          timestamp: now,
          message: "Application workflow initialized",
        },
      ],
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now,
  });
}

export function addApplicationAuditLog(
  application: ApplicationDocument,
  log: ApplicationAuditLog,
): ApplicationDocument {
  return ApplicationDocumentSchema.parse({
    ...application,
    auditLogs: [
      ...(application.auditLogs ?? []),
      ApplicationAuditLogSchema.parse(log),
    ],
    updatedAt: new Date(),
  });
}
