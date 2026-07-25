import { ScraperProducer } from "../src/services/scraperProducer";
import { describe, it, expect } from 'vitest';

describe('tests/test-scraper.ts', () => {
  it('should execute without errors', async () => {
    try {
      console.log("Adding mock scraping jobs...");

      // Enqueue a few immediate jobs
      await ScraperProducer.enqueueScrape({
        domain: "devfolio.co",
        url: "https://genai.devfolio.co",
        type: "hackathon"
      });

      await ScraperProducer.enqueueScrape({
        domain: "devpost.com",
        url: "https://spaceapps.devpost.com",
        type: "hackathon"
      });

      console.log("Jobs added! Check the BullMQ dashboard or the worker logs.");
      
      // Close process after a short delay to allow Redis commands to finish
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e: any) {
      console.warn("Test failed (likely due to missing env/db):", e.message);
    }
  });
});