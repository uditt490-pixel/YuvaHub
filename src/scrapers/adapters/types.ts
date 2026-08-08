export interface ScrapedOpportunity {
  title: string;
  organization: string;
  applyLink: string;
  tags: string[];
  deadline: string;
  location: string;
  opportunityType: string;
  description: string;
  sourceName: string;
}

export interface IScraperAdapter {
  readonly sourceName: string;
  readonly baseUrl: string;
  scrape(): Promise<ScrapedOpportunity[]>;
  validate(opportunity: Partial<ScrapedOpportunity>): boolean;
}
