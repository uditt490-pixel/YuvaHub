import { IScraperAdapter, ScrapedOpportunity } from './types.js';

export class DevpostAdapter implements IScraperAdapter {
  readonly sourceName = 'Devpost';
  readonly baseUrl = 'https://devpost.com';

  async scrape(): Promise<ScrapedOpportunity[]> {
    const results: ScrapedOpportunity[] = [];
    try {
      const res = await fetch(`${this.baseUrl}/rss`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
      });
      if (res.ok) {
        const text = await res.text();
        const itemMatches = text.match(/<item>[\s\S]*?<\/item>/gi) || [];
        for (const item of itemMatches) {
          const titleMatch = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
          const linkMatch = item.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
          const descMatch = item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);

          const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
          const applyLink = linkMatch ? linkMatch[1].trim() : '';
          const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';

          const opp: ScrapedOpportunity = {
            title: title || 'Devpost Hackathon',
            organization: 'Devpost Community',
            applyLink: applyLink || `${this.baseUrl}/hackathons`,
            tags: ['Hackathon', 'Devpost', 'Coding'],
            deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
            location: 'Global / Online',
            opportunityType: 'hackathon',
            description: description.substring(0, 300) || 'Devpost global hackathon challenge.',
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
