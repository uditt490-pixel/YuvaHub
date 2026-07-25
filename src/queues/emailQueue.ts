import { Queue } from "bullmq";
import { connection, isRedisReady } from "./connection";
import nodemailer from "nodemailer";

export const emailQueue = new Queue("emailQueue", { connection: connection as any });

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

const smtpHost = process.env.SMTP_HOST || "";
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
const smtpFrom = process.env.SMTP_FROM || "YuvaHub Alerts <noreply@yuvahub.xyz>";

let fallbackTransporter: nodemailer.Transporter | null = null;
if (smtpHost && smtpUser && smtpPass) {
  fallbackTransporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass }
  });
}

const memoryQueue: EmailJobData[] = [];
let memoryQueueTimer: ReturnType<typeof setInterval> | null = null;

function processMemoryQueue() {
  while (memoryQueue.length > 0) {
    const data = memoryQueue.shift()!;
    sendEmailDirect(data).catch(err => {
      console.error(`[EmailQueue Fallback] Direct send failed for ${data.to}:`, err);
    });
  }
}

async function sendEmailDirect(data: EmailJobData): Promise<void> {
  if (fallbackTransporter) {
    await fallbackTransporter.sendMail({
      from: smtpFrom,
      to: data.to,
      subject: data.subject,
      text: data.body,
      html: data.html || `<div style="font-family: sans-serif; padding: 20px;">${data.body}</div>`
    });
    console.log(`[EmailQueue Fallback] Delivered via direct SMTP to ${data.to}`);
  } else {
    console.warn(`[EmailQueue Fallback] *** EMAIL NOT SENT - No SMTP configured. Would have sent to ${data.to}: ${data.subject}`);
  }
}

export const enqueueEmail = async (data: EmailJobData) => {
  if (!isRedisReady()) {
    console.warn(`[EmailQueue Fallback] Redis offline. Using in-memory fallback for: ${data.to}`);
    memoryQueue.push(data);
    if (!memoryQueueTimer) {
      memoryQueueTimer = setInterval(processMemoryQueue, 2000);
      if (typeof memoryQueueTimer === 'object' && 'unref' in memoryQueueTimer) {
        (memoryQueueTimer as any).unref();
      }
    }
    return { id: `fallback_${Date.now()}`, data, fallback: true };
  }
  return await emailQueue.add("sendEmail", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  });
};
