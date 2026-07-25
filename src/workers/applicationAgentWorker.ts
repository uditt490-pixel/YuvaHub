import { Worker, Job } from "bullmq";
import { connection, isRedisReady } from "../queues/connection";
import { AgentJobData } from "../queues/agentQueue";
import { chromium, Browser } from "playwright";
import { getCommandDB } from "../lib/mongodb";
import { safeObjectId } from "../lib/utils.js";
import { analyzeDomWithGemini } from "../services/agent/domAnalyzer";
import { fillFormFields } from "../services/agent/formInteraction";

let worker: Worker<AgentJobData, any, string> | null = null;

export async function processAgentJob(job: any) {
  const { userId, jobUrl, action } = job.data;
  
  if (action !== "fill_application") return;

  await job.updateProgress({ status: "Starting application agent..." });
  
  const db = await getCommandDB();
  const oid = safeObjectId(userId);
  if (!oid) throw new Error("Invalid userId format provided to agent worker.");
  const user = await db.collection("users").findOne({ _id: oid });
  
  if (!user) {
    throw new Error("User not found for agent execution.");
  }
  
  await job.updateProgress({ status: "Launching secure browser session..." });
  
  let browser: Browser | null = null;
  
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await job.updateProgress({ status: `Navigating to ${jobUrl}...` });
    
    await page.goto(jobUrl, { waitUntil: "domcontentloaded" });
    
    await job.updateProgress({ status: "Analyzing page structure using Gemini..." });
    // Extract input elements to send to Gemini
    const domInputs = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
      return inputs.map(el => el.outerHTML).join('\n');
    });

    await job.updateProgress({ status: "Mapping user profile to form fields..." });
    const fieldMappings = await analyzeDomWithGemini(domInputs, user);
    
    if (fieldMappings && fieldMappings.length > 0) {
      await job.updateProgress({ status: `Filling out ${fieldMappings.length} form fields...` });
      await fillFormFields(page, fieldMappings);
    } else {
      await job.updateProgress({ status: "Could not identify any form fields to fill." });
    }
    
    // Check for captcha (simulation based on common keywords/elements)
    const hasCaptcha = await page.evaluate(() => {
      return !!document.querySelector('iframe[src*="recaptcha"], iframe[src*="hcaptcha"]');
    });
    
    if (hasCaptcha) {
      await job.updateProgress({ status: "CAPTCHA detected. Pausing agent. Please intervene." });
      throw new Error("CAPTCHA_DETECTED");
    }
    
    await job.updateProgress({ status: "Application form filled! Ready for final review." });
    
    // Wait briefly before closing
    await new Promise(r => setTimeout(r, 2000));
    
    return { success: true };
  } catch (error: any) {
    console.error("Agent error:", error);
    await job.updateProgress({ status: `Agent encountered an error: ${error.message}` });
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export function initAgentWorker() {
  if (worker) return worker;

  if (!isRedisReady()) {
    console.log("[AgentWorker] Redis connection offline. Worker listening paused.");
    return null;
  }

  worker = new Worker<AgentJobData>("agent-processing", processAgentJob, {
    connection: connection as any,
    concurrency: 2, // Headless browsers are heavy, limit concurrency
  });

  worker.on("completed", (job) => {
    console.log(`Agent job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Agent job ${job?.id} failed with ${err.message}`);
  });

  console.log("🛠️ Agent worker initialized");
  return worker;
}

export async function stopAgentWorker() {
  if (worker) {
    await worker.close();
    worker = null;
  }
}
