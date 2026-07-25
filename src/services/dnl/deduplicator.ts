import crypto from 'crypto';
import { NormalizedOpportunity } from './types';
import { eventBus } from '../../events/eventBus';
import { EventType, OpportunityScrapedEvent } from '../../events/schemas';

export function generateDedupeHash(url: string, title: string, company: string): string {
  const normalizedTitle = (title || '').toLowerCase();
  const normalizedCompany = (company || '').toLowerCase();
  const baseString = (url || '') + normalizedTitle + normalizedCompany;
  return crypto.createHash('sha256').update(baseString).digest('hex');
}

export interface IngestionResult {
  processed: number;
  inserted: number;
  duplicates: number;
  failures: number;
  errors: string[];
}

export async function ingestOpportunities(
  db: any,
  opportunities: NormalizedOpportunity[]
): Promise<IngestionResult> {
  const result: IngestionResult = {
    processed: opportunities.length,
    inserted: 0,
    duplicates: 0,
    failures: 0,
    errors: [],
  };

  for (const item of opportunities) {
    const dedupe_hash = generateDedupeHash(item.url, item.title, item.company);

    const event: OpportunityScrapedEvent = {
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      eventType: EventType.enum.OpportunityScraped,
      payload: {
        url: item.url,
        title: item.title,
        company: item.company,
        description: item.description,
        sourceName: item.sourceName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        tags: item.tags,
        opportunityType: item.opportunityType.toLowerCase(),
        deadline: item.deadline || null,
        location: item.location || '',
        dedupeHash: dedupe_hash,
      }
    };

    try {
      await eventBus.publish('opportunity.scraped', event);
      result.inserted++; // Logged as inserted since it's published to queue successfully
    } catch (err: any) {
      result.failures++;
      result.errors.push(err.stack || err.message || String(err));
    }
  }

  return result;
}
