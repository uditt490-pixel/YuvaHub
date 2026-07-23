import { enqueueEmail } from "../queues/emailQueue.js";
import { generateAdminAlertHtml } from "../workers/emailTemplates.js";

/**
 * Sends a critical alert to all configured system administrators.
 * Used when background workers or queues experience permanent failures.
 *
 * @param workerName The name of the worker (e.g. 'ScraperWorker')
 * @param job The BullMQ job object or any object containing job metadata
 * @param customEnqueue Optional dependency injection for mocking email queue during tests
 */
export const sendAdminAlert = async (workerName: string, job: any, error: any, customEnqueue?: typeof enqueueEmail) => {
  const _enqueue = customEnqueue || enqueueEmail;
  try {
    // 1. Get recipients: parse from config, supporting comma-separated multiple admins
    const adminEmailsConfig = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAILS || 'admin@yuvahub.com';
    const adminEmails = adminEmailsConfig.split(',').map(email => email.trim()).filter(email => email.length > 0);

    if (adminEmails.length === 0) {
      console.warn(`[${workerName}] No admin emails configured to receive alerts.`);
      return;
    }

    // 2. Extract job metadata safely
    const jobId = job?.id || 'unknown';
    const domain = job?.data?.domain || 'unknown';
    const retryCount = job?.attemptsMade || 0;
    const errorMessage = error?.message || String(error);

    // 3. Generate structured HTML template
    const htmlBody = generateAdminAlertHtml(workerName, jobId, domain, errorMessage, retryCount);
    
    // Fallback text body just in case email clients block HTML
    const textBody = `🚨 [Alert] ${workerName} Job Failed!
Job ID: ${jobId}
Domain: ${domain}
Reason: ${errorMessage}
Retry Count: ${retryCount}
Timestamp: ${new Date().toISOString()}`;

    // 4. Enqueue email to all admins independently using Promise.allSettled
    // This ensures that if one enqueue fails (e.g., malformed payload), others may still succeed.
    const results = await Promise.allSettled(
      adminEmails.map(email => 
        _enqueue({
          to: email,
          subject: `🚨 [Alert] ${workerName} Permanently Failed: ${domain}`,
          body: textBody,
          html: htmlBody
        })
      )
    );

    // 5. Log outcome
    const failedCount = results.filter(r => r.status === 'rejected').length;
    if (failedCount > 0) {
      console.error(`[${workerName}] Alert failed to enqueue for ${failedCount} admin(s).`);
    } else {
      console.log(`[${workerName}] Admin alert triggered for job ${jobId} to ${adminEmails.length} recipient(s).`);
    }
  } catch (err) {
    // Top-level catch ensures this function NEVER crashes the calling worker
    console.error(`[${workerName}] Critical failure in sendAdminAlert helper:`, err);
  }
};
