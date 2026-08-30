import { Request, Response } from 'express';
import { Queue, QueueEvents } from 'bullmq';
import { ScraperBlueprint } from '../models/ScraperBlueprint';

const scraperQueue = new Queue('scraper-queue', { connection: { host: 'localhost', port: 6379 } });
const scraperQueueEvents = new QueueEvents('scraper-queue', { connection: { host: 'localhost', port: 6379 } });

export const testScraperBlueprint = async (req: Request, res: Response) => {
  try {
    const blueprint = req.body;
    const job = await scraperQueue.add('test-scrape', { blueprint, isTestRun: true });
    
    // Wait for worker result with a 15s timeout
    const result = await job.waitUntilFinished(scraperQueueEvents, 15000);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const saveScraperBlueprint = async (req: Request, res: Response) => {
  try {
    const blueprint = new ScraperBlueprint(req.body);
    await blueprint.save();
    return res.status(201).json({ success: true, data: blueprint });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
