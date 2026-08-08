import { IScraperAdapter, ScrapedOpportunity } from './types.js';

export class KaggleAdapter implements IScraperAdapter {
  readonly sourceName = 'Kaggle';
  readonly baseUrl = 'https://www.kaggle.com';

  async scrape(): Promise<ScrapedOpportunity[]> {
    const results: ScrapedOpportunity[] = [];
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/competitions/list`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
      });
      if (res.ok) {
        const data = await res.json() as any[];
        if (Array.isArray(data)) {
          for (const item of data.slice(0, 10)) {
            const opp: ScrapedOpportunity = {
              title: item.title || 'Kaggle ML Competition',
              organization: item.organizationName || 'Kaggle',
              applyLink: item.url || `${this.baseUrl}/competitions`,
              tags: ['Kaggle', 'Machine Learning', 'Data Science'],
              deadline: item.deadline || new Date(Date.now() + 60 * 86400000).toISOString(),
              location: 'Online / Global',
              opportunityType: 'competition',
              description: item.description || 'Kaggle Machine Learning competition challenge.',
              sourceName: this.sourceName,
            };
            if (this.validate(opp)) {
              results.push(opp);
            }
          }
        }
      }
    } catch (err: any) {
      console.error(`[${this.sourceName}Adapter] Scraping error:`, err.message);
    }
    return results;
  }

  validate(opportunity: Partial<ScrapedOpportunity>): boolean {
    return Boolean(opportunity.title && opportunity.applyLink && opportunity.sourceName);
  }
}
