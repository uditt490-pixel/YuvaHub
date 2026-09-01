import crypto from 'crypto';
import { NormalizedOpportunity } from './types';
import { eventBus } from '../../events/eventBus';
import { EventType, OpportunityScrapedEvent } from '../../events/schemas';
import { createOpportunityScrapedConsumer } from '../../consumers/opportunityScrapedConsumer';

/** Fields used to build a stable, deterministic deduplication key. */
export interface DedupeKeyParts {
  source: string;
  url: string;
  title: string;
  company: string;
  /** Optional stable identifier from the source (e.g. a listing/job id). */
  externalId?: string;
}

/** Normalize a single key component: coerce to string, trim, collapse
 * internal whitespace and lowercase so trivial formatting differences do not
 * produce different hashes. */
function normalizeComponent(value: unknown): string {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Generate a deterministic SHA-256 deduplication hash from stable identifiers.
 *
 * The hash intentionally contains NO timestamps or other volatile data, so
 * identical opportunities always produce an identical hash and can be
 * deduplicated. Components are joined with a delimiter (`|`) so field
 * boundaries cannot collide (e.g. `"ab" + "c"` vs `"a" + "bc"`).
 *
 * Two call styles are supported for backwards compatibility:
 *   generateDedupeHash({ source, url, title, company, externalId? })
 *   generateDedupeHash(url, title, company)
 */
export function generateDedupeHash(parts: DedupeKeyParts): string;
export function generateDedupeHash(url: string, title: string, company: string): string;
export function generateDedupeHash(
  partsOrUrl: DedupeKeyParts | string,
  title?: string,
  company?: string,
): string {
  const parts: DedupeKeyParts =
    typeof partsOrUrl === 'string'
      ? { source: '', url: partsOrUrl, title: title ?? '', company: company ?? '' }
      : partsOrUrl;

  const baseString = [
    normalizeComponent(parts.source),
    normalizeComponent(parts.externalId),
    normalizeComponent(parts.url),
    normalizeComponent(parts.title),
    normalizeComponent(parts.company),
  ].join('|');
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
    const dedupe_hash = generateDedupeHash({
      source: item.sourceName,
      url: item.url,
      title: item.title,
      company: item.company,
    });

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
      if (db && db.isMock) {
        const consumer = await createOpportunityScrapedConsumer(db);
        // Invoke the consumer directly for mock DB tests to simulate queue execution synchronously
        await consumer(event);
      } else {
        await eventBus.publish('opportunity.scraped', event);
      }
      result.inserted++; // Logged as inserted since it's published to queue successfully (or inserted directly in mock)
    } catch (err: any) {
      if (err.code === 11000) {
        result.duplicates++;
      } else {
        result.failures++;
        result.errors.push(err.stack || err.message || String(err));
      }
    }
  }

  return result;
}
