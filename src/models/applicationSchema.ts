import { z } from "zod";

export const ApplicationStatusSchema = z.enum([
  "draft",
  "pending_confirmation",
  "queued",
  "submitting",
  "submitted",
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
    applyUrl: z.string().url().optional(),
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
  retryCount: z.number().int().min(0).max(20).default(0),
  lastError: z.string().max(4000).optional(),
  externalApplicationId: z.string().trim().optional(),
  userConfirmed: z.boolean().default(false),
  auditLogs: z.array(ApplicationAuditLogSchema).max(200),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ApplicationDocument = z.infer<
  typeof ApplicationDocumentSchema
>;

export type ApplicationStatus =
  | "draft"
  | "interested"
  | "pending_confirmation"
  | "queued"
  | "submitting"
  | "submitted"
  | "under_review"
  | "interview_scheduled"
  | "selected"
  | "rejected"
  | "failed"
  | "retrying";


export interface ApplicationAuditLog {
  action:
    | "CREATED"
    | "CONFIRMED"
    | "QUEUED"
    | "SUBMISSION_STARTED"
    | "SUBMITTED"
    | "FAILED"
    | "RETRY_TRIGGERED"
    | "INTERESTED"
    | "UNDER_REVIEW"
    | "INTERVIEW_SCHEDULED"
    | "SELECTED"
    | "REJECTED";

  timestamp: Date;

  message?: string;

  metadata?: Record<string, any>;
}


export interface ApplicationDocument {
  _id?: string;

  /**
   * Owner of the application
   */
  userId: string;

notes?: string;

deadline?: Date | string;
  /**
   * Opportunity being applied for
   */
  opportunityId: string;


  /**
   * Opportunity snapshot
   * Prevents data loss if opportunity changes later
   */
  opportunity: {
    title: string;
    organization?: string;
    platform?: string;
    applyUrl?: string;
  };

  /**
 * Personal notes for application tracking
 */
notes?: string;

/**
 * Application deadline snapshot
 */
deadline?: Date | string;


  /**
   * Resume information
   */
  resume?: {
    name: string;
    url: string;
  };


  /**
   * Cover letter / generated application content
   */
  coverLetter?: {
    template?: string;
    content: string;
  };


  /**
   * Platform adapter used for submission
   * Example:
   * internshala
   * devpost
   */
  platform: string;


  /**
   * Current workflow state
   */
  status: ApplicationStatus;


  /**
   * Number of submission attempts
   */
  retryCount: number;


  /**
   * Last error if submission failed
   */
  lastError?: string;


  /**
   * External application reference
   * Returned by supported platforms
   */
  externalApplicationId?: string;


  /**
   * Compliance tracking
   */
  userConfirmed: boolean;


  /**
   * Audit history
   */
  auditLogs: ApplicationAuditLog[];


  createdAt: Date;

  updatedAt: Date;
}


/**
 * Factory helper
 * Creates a clean application document
 */

export function createApplicationDocument(
  data: Partial<ApplicationDocument>,
): ApplicationDocument {
  const now = new Date();


  return {
    userId: data.userId || "",

    opportunityId: data.opportunityId || "",

    opportunity: data.opportunity || {
      title: "",
    },
    notes: data.notes,

deadline: data.deadline,


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
