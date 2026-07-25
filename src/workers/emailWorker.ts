import { Worker, Job } from "bullmq";
import { connection } from "../queues/connection";
import { EmailJobData } from "../queues/emailQueue";
import nodemailer from "nodemailer";

// Retrieve SMTP settings from environment with secure defaults
const smtpHost = process.env.SMTP_HOST || "";
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
const smtpFrom = process.env.SMTP_FROM || "YuvaHub Alerts <noreply@yuvahub.xyz>";

// Initialize transporter only if credentials are provided, else fallback to mock log
let transporter: nodemailer.Transporter | null = null;
if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // True for port 465, false otherwise
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
  console.log(`[EmailWorker] SMTP Transporter configured for host: ${smtpHost}`);
} else {
  console.log("[EmailWorker] SMTP credentials missing. Running in simulated fallback mode.");
}

export const emailWorker = new Worker<EmailJobData>(
  "emailQueue",
  async (job: Job<EmailJobData>) => {
    const { to, subject, body, html } = job.data;
    console.log(`[EmailWorker] Processing job ${job.id} for ${to}`);

    if (transporter) {
      // Send real email via SMTP
      try {
        await transporter.sendMail({
          from: smtpFrom,
          to,
          subject,
          text: body,
          html: html || `<div style="font-family: sans-serif; padding: 20px;">${body}</div>`
        });
        console.log(`[EmailWorker] Successfully sent email via SMTP to ${to}`);
      } catch (smtpErr: any) {
        console.error(`[EmailWorker] SMTP delivery failed to ${to}:`, smtpErr.message);
        throw smtpErr; // Let BullMQ handle retry mechanism
      }
    } else {
      // Simulated email sending delay (fallback)
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      // Simulate random failure for resiliency testing (10% chance)
      if (Math.random() < 0.1) {
        throw new Error(`Simulated mock email delivery failure for job ${job.id}`);
      }
      
      console.log(`[EmailWorker] Mock Sent: To: ${to} | Subject: ${subject} | Body: ${body}`);
    }
  },
  { connection: connection as any }
);

emailWorker.on("completed", (job) => {
  console.log(`[EmailWorker] Job ${job.id} completed successfully`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`[EmailWorker] Job ${job?.id} failed with error: ${err.message}`);
  
  if (job && job.attemptsMade >= (job.opts.attempts || 1)) {
    console.error(`[EmailWorker] Job ${job.id} has exhausted all retries. Moving to DLQ (Logged).`);
  }
});

let emailWorkerErrorLogged = false;
emailWorker.on("error", (err) => {
  if (!emailWorkerErrorLogged) {
    console.warn('[EmailWorker] Redis connection offline. Worker listening paused.');
    emailWorkerErrorLogged = true;
  }
});
