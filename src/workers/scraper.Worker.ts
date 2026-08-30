import { Worker, Job } from 'bullmq';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import { IScraperBlueprint } from '../models/ScraperBlueprint';

interface ScraperJobData {
  blueprint: IScraperBlueprint;
  isTestRun?: boolean;
}

export const scraperWorker = new Worker(
  'scraper-queue',
  async (job: Job<ScraperJobData>) => {
    const { blueprint, isTestRun } = job.data;
    const extractedData: any[] = [];
    let html = '';

    if (blueprint.renderMode === 'static') {
      const response = await axios.get(blueprint.targetUrl, {
        headers: blueprint.headers || {},
      });
      html = response.data;
    } else {
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(blueprint.targetUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector(blueprint.selectors.listContainer, { timeout: 10000 });
      html = await page.content();
      await browser.close();
    }

    const $ = cheerio.load(html);
    $(blueprint.selectors.listContainer).each((_, element) => {
      const el = $(element);
      const rawTitle = el.find(blueprint.selectors.title).text().trim();
      const rawLink = el.find(blueprint.selectors.link).attr('href');
      const rawDeadline = blueprint.selectors.deadline ? el.find(blueprint.selectors.deadline).text().trim() : null;
      const rawDescription = blueprint.selectors.description ? el.find(blueprint.selectors.description).text().trim() : null;
      const rawOrg = blueprint.selectors.organization ? el.find(blueprint.selectors.organization).text().trim() : null;

      if (rawTitle && rawLink) {
        const absoluteLink = rawLink.startsWith('http') ? rawLink : new URL(rawLink, blueprint.targetUrl).toString();
        extractedData.push({
          title: rawTitle,
          link: absoluteLink,
          deadline: rawDeadline,
          description: rawDescription,
          organization: rawOrg,
          source: `custom_blueprint:${(blueprint as any)._id || 'test'}`,
        });
      }
    });

    if (isTestRun) {
      return extractedData.slice(0, 5); // Return top 5 for preview
    }

    // TODO: Push extractedData to main opportunity ingestion queue
    return { count: extractedData.length, items: extractedData };
  },
  { connection: { host: 'localhost', port: 6379 } }
);
