import { Queue } from 'bullmq';
import { ScraperBlueprint } from '../models/ScraperBlueprint';

const scraperQueue = new Queue('scraper-queue', { connection: { host: 'localhost', port: 6379 } });

export class DNLDispatcher {
  public static async dispatchActiveScrapers() {
    try {
      const activeBlueprints = await ScraperBlueprint.find({ enabled: true });
      
      for (const blueprint of activeBlueprints) {
        await scraperQueue.add('scheduled-scrape', { blueprint, isTestRun: false }, {
          repeat: { pattern: '0 */6 * * *' }, // Run every 6 hours
          jobId: `blueprint-${blueprint._id}`,
        });
      }
      console.log(`Dispatched ${activeBlueprints.length} dynamic scraper blueprints.`);
    } catch (error) {
      console.error('Failed to dispatch dynamic scrapers:', error);
    }
  }
}
