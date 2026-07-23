import { scraperQueue } from "../queues/scraperQueue";

export interface ScrapeJobPayload {
  domain: string;
  url: string;
  type: string;
}

export class ScraperProducer {
  /**
   * Enqueues an immediate one-off scraping job.
   */
  static async enqueueScrape(payload: ScrapeJobPayload) {
    console.log(`[ScraperProducer] Enqueuing immediate scrape for ${payload.url}`);
    await scraperQueue.add("scrape", payload);
  }

  /**
   * Schedules a recurring cron job for scraping.
   */
  static async scheduleCronScrape(payload: ScrapeJobPayload, cronExpression: string) {
    console.log(`[ScraperProducer] Scheduling cron scrape for ${payload.url} with cron ${cronExpression}`);
    await scraperQueue.add("scrape", payload, {
      repeat: {
        pattern: cronExpression,
      },
    });
  }
}
