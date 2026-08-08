import { IScraperAdapter, ScrapedOpportunity } from './types.js';

export class MLHAdapter implements IScraperAdapter {
  readonly sourceName = 'MLH';
  readonly baseUrl = 'https://mlh.io';

  async scrape(): Promise<ScrapedOpportunity[]> {
    const results: ScrapedOpportunity[] = [];
    try {
      const res = await fetch(`${this.baseUrl}/seasons/2026/events`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
      });
      if (res.ok) {
        const html = await res.text();
        const eventRegex = /<div class="event[\s\S]*?<h3 class="event-name">([\s\S]*?)<\/h3>[\s\S]*?<a href="([\s\S]*?)"/gi;
        let match;
        while ((match = eventRegex.exec(html)) !== null) {
          const title = match[1].replace(/<[^>]+>/g, '').trim();
          const applyLink = match[2].trim();
          const opp: ScrapedOpportunity = {
            title,
            organization: 'Major League Hacking (MLH)',
            applyLink,
            tags: ['MLH', 'Student', 'Hackathon'],
            deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
            location: 'Global / Hybrid',
            opportunityType: 'hackathon',
            description: `Official MLH Season Hackathon event: ${title}`,
            sourceName: this.sourceName,
          };
          if (this.validate(opp)) {
            results.push(opp);
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
