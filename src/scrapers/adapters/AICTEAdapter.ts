import { IScraperAdapter, ScrapedOpportunity } from './types.js';

export class AICTEAdapter implements IScraperAdapter {
  readonly sourceName = 'AICTE';
  readonly baseUrl = 'https://internship.aicte-india.org';

  async scrape(): Promise<ScrapedOpportunity[]> {
    const results: ScrapedOpportunity[] = [];
    try {
      const res = await fetch(`${this.baseUrl}/internship-search.php`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
      });
      if (res.ok) {
        const html = await res.text();
        const cardRegex = /<div class=["']card-body["']>[\s\S]*?<h5>([\s\S]*?)<\/h5>[\s\S]*?<a href=["']([\s\S]*?)["']/gi;
        let match;
        while ((match = cardRegex.exec(html)) !== null) {
          const title = match[1].replace(/<[^>]+>/g, '').trim();
          const applyLink = match[2].trim();
          const opp: ScrapedOpportunity = {
            title: title || 'AICTE Internship Program',
            organization: 'AICTE Govt of India',
            applyLink: applyLink.startsWith('http') ? applyLink : `${this.baseUrl}/${applyLink}`,
            tags: ['AICTE', 'Internship', 'Government', 'India'],
            deadline: new Date(Date.now() + 45 * 86400000).toISOString(),
            location: 'India / Remote',
            opportunityType: 'internship',
            description: 'AICTE Govt Internship opportunity for engineering and tech students.',
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
