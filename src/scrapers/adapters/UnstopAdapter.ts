import { IScraperAdapter, ScrapedOpportunity } from './types.js';

export class UnstopAdapter implements IScraperAdapter {
  readonly sourceName = 'Unstop';
  readonly baseUrl = 'https://unstop.com';

  async scrape(): Promise<ScrapedOpportunity[]> {
    const results: ScrapedOpportunity[] = [];
    try {
      const res = await fetch(`${this.baseUrl}/api/public/opportunity/search-result?opportunity=hackathons`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
      });
      if (res.ok) {
        const json = await res.json() as any;
        const items = json?.data?.data || json?.data || [];
        if (Array.isArray(items)) {
          for (const item of items) {
            const opp: ScrapedOpportunity = {
              title: item.title || item.name || 'Unstop Competition',
              organization: item.organisation?.name || item.company_name || 'Unstop Partner',
              applyLink: item.public_url || `${this.baseUrl}/competitions`,
              tags: ['Unstop', 'Competition', 'Students'],
              deadline: item.end_date || new Date(Date.now() + 20 * 86400000).toISOString(),
              location: item.region || 'India / Online',
              opportunityType: 'hackathon',
              description: item.seo_meta_description || item.details || 'Explore Unstop developer challenge.',
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
