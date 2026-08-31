import { logger } from "../lib/logger.js";
import { Worker, Job } from "bullmq";
import { connection } from "../queues/connection";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import crypto from "crypto";
import { generateOpportunityEmbedding } from "../services/embedding.js";
import { scrapeOpportunity } from "../services/scrapers/realScraper.js";

import { sendAdminAlert } from "../services/adminAlertService.js";
import { scrapeRealURL } from "../scrapers/realScrapers.js";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB_NAME || "yuvahub";

const mongoClient = new MongoClient(uri);

mongoClient.connect().catch((err) => {
  logger.error({ err: err }, "[ScraperWorker] MongoDB connection error:");
});

export const scraperWorker = new Worker(
  "scraper-jobs",
  async (job: Job) => {
    const { domain, url, type } = job.data;

    logger.info(`[ScraperWorker] Processing job ${job.id} for domain: ${domain}, url: ${url}`);

    const realData = url ? await scrapeRealURL(url, domain, type) : null;

    const title = realData?.title || `Opportunity from ${domain}`;
    const organization = realData?.organization || domain;
    const description = realData?.description || `Live opportunity scraped from ${domain}.`;
    const deadline = realData?.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const dedupeHash = crypto
      .createHash("sha256")
      .update(`${domain}:${title}:${organization}`)
      .digest("hex");

    const opportunity = {
      url: url || "https://yuvahub.xyz",
      title,
      company: organization,
      description,
      sourceName: domain,
      tags: realData?.tags || ["Scraped", type],
      opportunityType: type || "hackathon",
      deadline,
      location: realData?.location || "Online",
      dedupe_hash: dedupeHash,
      createdAt: new Date().toISOString(),
      embedding: null as number[] | null,
    };


    logger.info(
      `[ScraperWorker] Processing job ${job.id} for domain: ${domain}, url: ${url}`
    );

    const scrapedItems = await scrapeOpportunity(domain, url, type);

    if (scrapedItems.length === 0) {
      throw new Error(`No opportunities extracted from ${url}`);
    }

    const db = mongoClient.db(dbName);
    const results = [];

    for (const item of scrapedItems) {
      const dedupeHash = crypto
        .createHash("md5")
        .update(`${item.sourceName}:${item.url}:${item.title}:${item.company}`)
        .digest("hex");

      const opportunity = {
        url: item.url,
        title: item.title,
        company: item.company,
        description: item.description,
        sourceName: item.sourceName,
        tags: item.tags,
        opportunityType: item.opportunityType,
        deadline: item.deadline,
        location: item.location,
        dedupeHash,
        createdAt: new Date().toISOString(),
        embedding: null as number[] | null,
      };

      const embeddingText = [
        item.title,
        item.company,
        item.description,
        item.opportunityType,
      ].join(" ");

      opportunity.embedding =
        await generateOpportunityEmbedding(embeddingText);

      const result = await db.collection("opportunities").updateOne(
        { dedupeHash: opportunity.dedupeHash },
        { $set: opportunity },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        logger.info(
          `[ScraperWorker] Inserted real opportunity: ${item.title}`
        );
      } else {
        logger.info(
          `[ScraperWorker] Updated existing opportunity: ${item.title}`
        );
      }

      results.push({
        title: item.title,
        dedupeHash: opportunity.dedupeHash,
      });
    }


    return {
      status: "success",
      source: domain,
      count: results.length,
      results,
    };

    return { status: "success", dedupe_hash: opportunity.dedupe_hash };

  },
  {
    connection: connection as any,

    limiter: {
      max: 5,
      duration: 1000,
    },
  }
);

scraperWorker.on("completed", (job) => {
  logger.info(`[ScraperWorker] Job ${job.id} completed successfully.`);
});

scraperWorker.on("failed", (job, err) => {
  logger.error(
    `[ScraperWorker] Job ${job?.id} failed with error: ${err.message}`
  );

  if (
    job &&
    job.opts.attempts &&
    job.attemptsMade === job.opts.attempts
  ) {
    logger.error(
      `[ALERT] Scraper Job ${job.id} for domain ${job.data.domain} failed ${job.attemptsMade} times in a row! Maintenance required.`
    );
    sendAdminAlert("ScraperWorker", job, err);
  }
});

let scraperWorkerErrorLogged = false;
scraperWorker.on("error", (err) => {
  if (!scraperWorkerErrorLogged) {
    logger.warn('[ScraperWorker] Redis connection offline. Worker listening paused.');
    scraperWorkerErrorLogged = true;

  }
});