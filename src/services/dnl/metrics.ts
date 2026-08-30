import { ScraperMetrics } from './types';
import { ScraperAlertService } from '../../api/services/scraperAlertService.js';

export async function initializeDNLDatabase(db: any): Promise<void> {
  if (!db || db.isMock) {
    console.log('[DNL] Database is undefined or in Mock mode. Skipping DB level index creation.');
    return;
  }

  try {
    // 1. Enforce database-level deduplication by adding a unique index constraint on dedupe_hash.
    // Use partialFilterExpression to ignore legacy documents that do not have the dedupe_hash field.
    await db.collection('opportunities').createIndex(
      { dedupe_hash: 1 },
      { 
        unique: true,
        partialFilterExpression: { dedupe_hash: { $exists: true } }
      }
    );
    console.log('[DNL] Unique index constraint on opportunities.dedupe_hash verified/created.');
  } catch (err) {
    console.error('[DNL] Failed to create unique index on opportunities.dedupe_hash:', err);
  }

  try {
    // 2. Setup the capped scraper_metrics collection
    const collections = await db.listCollections({ name: 'scraper_metrics' }).toArray();
    let isCapped = false;
    if (collections.length > 0) {
      isCapped = !!collections[0].options?.capped;
    }

    if (!isCapped) {
      if (collections.length > 0) {
        console.log('[DNL] Existing scraper_metrics is not capped. Re-creating as a capped collection.');
        await db.collection('scraper_metrics').drop();
      }
      await db.createCollection('scraper_metrics', {
        capped: true,
        size: 5242880, // 5MB
        max: 5000 // 5000 items
      });
      console.log('[DNL] Created capped scraper_metrics collection.');
    } else {
      console.log('[DNL] Capped scraper_metrics collection already exists.');
    }
  } catch (err) {
    console.error('[DNL] Failed to create capped scraper_metrics collection:', err);
  }
}

export async function logTelemetry(db: any, metrics: ScraperMetrics): Promise<void> {
  if (!db) return;
  
  try {
    // Insert into the capped collection
    if (db.isMock) {
      await db.collection('scraper_metrics').insertOne(metrics);
    } else {
      // Upsert metrics summary to keep the latest status per scraper for fleet status AND insert log/history
      // The instructions say: "Create a scraper_metrics capped collection to log telemetry. Telemetry: Log TTFB, payloads processed, and raw stack traces."
      // Since it's a capped collection, we just insert the telemetry event.
      await db.collection('scraper_metrics').insertOne(metrics);
    }
    console.log(`[DNL Telemetry] Logged telemetry for ${metrics.name}. Status: ${metrics.status}, Processed: ${metrics.payloads_processed}`);
    
    // Evaluate metrics for real-time alerting
    await ScraperAlertService.evaluateMetrics(metrics);
  } catch (err) {
    console.error('[DNL Telemetry] Failed to log telemetry:', err);
  }
}
