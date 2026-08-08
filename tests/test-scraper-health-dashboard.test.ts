import { describe, it, expect } from 'vitest';
import { adminScraperHealth } from '../src/api/controllers/adminController.js';

describe('Scraper Health Dashboard (#585)', () => {
  it('should return scraper health metrics and summary statistics', async () => {
    const req: any = {};
    let statusSent = 0;
    let jsonResult: any = null;

    const res: any = {
      status(code: number) {
        statusSent = code;
        return this;
      },
      json(data: any) {
        jsonResult = data;
        return this;
      }
    };

    await adminScraperHealth(req, res);

    const summary = jsonResult.summary || jsonResult.data?.summary;
    const sources = jsonResult.sources || jsonResult.data?.sources;

    expect(jsonResult).toBeDefined();
    expect(jsonResult.success).toBe(true);
    expect(summary).toBeDefined();
    expect(summary.totalSources).toBe(5);
    expect(sources.length).toBe(5);

    const devpost = sources.find((s: any) => s.name === 'Devpost');
    expect(devpost).toBeDefined();
    expect(devpost.lastSuccessfulScrape).toBeDefined();
    expect(devpost.failureCount).toBeDefined();
    expect(devpost.successRate).toBeDefined();
    expect(devpost.responseTimeMs).toBeDefined();
    expect(devpost.opportunitiesCollected).toBeDefined();
  });
});
