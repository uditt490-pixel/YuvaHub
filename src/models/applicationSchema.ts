/**
 * Application Schema
 * 
 * Stores user application workflow data for:
 * - One-click apply
 * - Application tracking
 * - Retry handling
 * - Audit logging
 */

export type ApplicationStatus =
  | "draft"
  | "pending_confirmation"
  | "queued"
  | "submitting"
  | "submitted"
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
    | "RETRY_TRIGGERED";

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
  data: Partial<ApplicationDocument>
): ApplicationDocument {

  const now = new Date();

  return {
    userId: data.userId || "",

    opportunityId: data.opportunityId || "",

    opportunity: data.opportunity || {
      title: "",
    },

    resume: data.resume,

    coverLetter: data.coverLetter,

    platform: data.platform || "unknown",

    status:
      data.status ||
      "pending_confirmation",

    retryCount:
      data.retryCount || 0,

    lastError:
      data.lastError,

    externalApplicationId:
      data.externalApplicationId,

    userConfirmed:
      data.userConfirmed || false,

    auditLogs:
      data.auditLogs || [
        {
          action: "CREATED",
          timestamp: now,
          message:
            "Application workflow initialized",
        },
      ],

    createdAt:
      data.createdAt || now,

    updatedAt:
      data.updatedAt || now,
  };
}


/**
 * Helper to append audit events
 */
export function addApplicationAuditLog(
  application: ApplicationDocument,
  log: ApplicationAuditLog
): ApplicationDocument {

  return {
    ...application,

    auditLogs: [
      ...(application.auditLogs || []),
      log,
    ],

    updatedAt: new Date(),
  };
}