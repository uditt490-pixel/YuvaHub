import { Worker, Job } from 'bullmq';
import { NewsletterService } from '../services/newsletter.service';
import { UserPreferences } from '../models/UserPreferences';

export const newsletterWorker = new Worker(
  'newsletter-queue',
  async (job: Job) => {
    let skip = 0;
    const batchSize = 100;
    let totalProcessed = 0;

    while (true) {
      const result = await NewsletterService.sendNewsletterBatch(batchSize, skip);
      if (result.processed === 0) break;
      totalProcessed += result.processed;
      skip += batchSize;
    }

    return { success: true, totalProcessed };
  },
  { connection: { host: 'localhost', port: 6379 } }
);
