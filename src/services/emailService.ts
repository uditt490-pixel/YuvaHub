import { enqueueEmail } from "../queues/emailQueue.js";

export interface MaskedIntroductionEmailParams {
  to: string;
  from?: string;
  subject: string;
  body: string;
  acceptLink?: string;
}

export interface TransactionalNotificationParams {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export const emailService = {
  /**
   * Send a transactional email wrapper. Direct email addresses are kept masked from the student.
   */
  sendMaskedIntroductionEmail: async (params: MaskedIntroductionEmailParams) => {
    const { to, subject, body, acceptLink } = params;
    const htmlContent = `
      <div style="font-family: sans-serif; padding: 24px; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #4f46e5; margin-top: 0;">New Mentorship Request</h2>
        <p style="font-size: 15px; color: #334155;">${body}</p>
        ${
          acceptLink
            ? `<div style="margin: 24px 0;">
                <a href="${acceptLink}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Review & Accept Request</a>
              </div>`
            : ''
        }
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #64748b;">
          This message was sent via YuvaHub Masked Mentorship Communication System. Direct email addresses are protected and hidden until you explicitly accept the request.
        </p>
      </div>
    `;

    return await enqueueEmail({
      to,
      subject,
      body,
      html: htmlContent,
    });
  },

  /**
   * Fire off transactional notification loop to alert candidate or user immediately.
   */
  sendTransactionalNotification: async (params: TransactionalNotificationParams) => {
    const { to, subject, body, html } = params;
    return await enqueueEmail({
      to,
      subject,
      body,
      html: html || `<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">${body}</div>`,
    });
  },
};
