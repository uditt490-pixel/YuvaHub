import { Worker, Job } from "bullmq";
import { connection } from "../queues/connection";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB_NAME || "yuvahub";

// Maintain a single MongoDB client for the worker
const mongoClient = new MongoClient(uri);
mongoClient.connect().catch((err) => {
  console.error("[ScraperWorker] MongoDB connection error:", err);
});

export const scraperWorker = new Worker(
  "scraper-jobs",
  async (job: Job) => {
    const { domain, url, type } = job.data;
    console.log(`[ScraperWorker] Processing job ${job.id} for domain: ${domain}, url: ${url}`);

    // MOCK extraction logic (In a real scenario, you'd use Axios/Puppeteer here)
    // Simulating delay for network request
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Simulate finding a new opportunity based on the job data
    const title = `Mock Opportunity from ${domain} - ${Date.now()}`;
    const organization = `Mock Org ${domain}`;
    const dedupeHash = crypto
      .createHash("md5")
      .update(`${domain}:${title}:${organization}`)
      .digest("hex");

    const opportunity = {
      url,
      title,
      company: organization,
      description: "This is a mock description extracted by the worker.",
      sourceName: domain,
      tags: ["Scraped", type],
      opportunityType: type,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      location: "Online",
      dedupeHash,
      createdAt: new Date().toISOString(),
    };

    // Upsert into MongoDB for idempotency
    const db = mongoClient.db(dbName);
    const result = await db.collection("opportunities").updateOne(
      { dedupeHash: opportunity.dedupeHash },
      { $set: opportunity },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log(`[ScraperWorker] Inserted new opportunity: ${title}`);
    } else {
      console.log(`[ScraperWorker] Updated existing opportunity: ${title}`);
    }

    return { status: "success", dedupeHash: opportunity.dedupeHash };
  },
  {
    connection: connection as any,
    // Rate Limiting: max 5 jobs per second
    limiter: {
      max: 5,
      duration: 1000,
    },
  }
);

scraperWorker.on("completed", (job) => {
  console.log(`[ScraperWorker] Job ${job.id} completed successfully.`);
});

scraperWorker.on("failed", (job, err) => {
  console.error(`[ScraperWorker] Job ${job?.id} failed with error: ${err.message}`);
  
  // Alerting mechanism: Check if this was the final attempt
  if (job && job.opts.attempts && job.attemptsMade === job.opts.attempts) {
    console.error(`[ALERT] Scraper Job ${job.id} for domain ${job.data.domain} failed ${job.attemptsMade} times in a row! Maintenance required.`);
    // TODO: Publish to emailQueue to alert admin
  }
});
