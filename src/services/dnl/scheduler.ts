import { IOpportunityAdapter } from './types';
import { ingestOpportunities } from './deduplicator';
import { logTelemetry } from './metrics';
import { createBreaker } from '../circuitBreaker';

export class DNLDispatcher {
  private db: any;
  private adapters: IOpportunityAdapter[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private breakers: Record<string, any> = {};

  constructor(db: any) {
    this.db = db;
  }

  registerAdapter(adapter: IOpportunityAdapter) {
    this.adapters.push(adapter);
  }

  private getBreaker(sourceName: string) {
    if (!this.breakers[sourceName]) {
      const fetchCb = async (url: string) => {
        const fetchStart = performance.now();
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let ttfb = 0;
        // In Node.js environment, response.body might not have getReader if it's node-fetch.
        // We'll do a simple fallback if reader is not available.
        if (response.body && typeof (response.body as any).getReader === 'function') {
          const reader = (response.body as any).getReader();
          await reader.read();
          ttfb = Math.round(performance.now() - fetchStart);
        } else {
          ttfb = Math.round(performance.now() - fetchStart);
        }
        
        const text = await response.text();
        return { text, ttfb };
      };
      
      const breaker = createBreaker(
        fetchCb,
        { timeout: 10000, errorThresholdPercentage: 50, resetTimeout: 30000 },
        sourceName
      );
      
      breaker.fallback((url, err) => {
        // Return empty payload array if circuit opens or fetch fails
        return { text: "[]", ttfb: 0 };
      });

      this.breakers[sourceName] = breaker;
    }
    return this.breakers[sourceName];
  }

  // Orchestrate a single run for an adapter with its payload/url
  async runScrape(adapter: IOpportunityAdapter, fetchUrlOrPayload: string | any[]): Promise<void> {
    const startTime = performance.now();
    let ttfb = 0;
    let rawPayload: any = null;
    let errorStack: string | null = null;
    let status: 'healthy' | 'degraded' | 'failed' = 'healthy';

    try {
      if (typeof fetchUrlOrPayload === 'string') {
        const breaker = this.getBreaker(adapter.sourceName);
        const result = await breaker.fire(fetchUrlOrPayload);
        ttfb = result.ttfb;
        rawPayload = JSON.parse(result.text);
      } else {
        // Static/mock payload
        const simulatedDelay = Math.floor(Math.random() * 50) + 10; // 10ms-60ms
        await new Promise((resolve) => setTimeout(resolve, simulatedDelay));
        ttfb = simulatedDelay;
        rawPayload = fetchUrlOrPayload;
      }

      // 2. Normalization
      const normalized = adapter.normalize(rawPayload);

      // 3. Deduplication & Database Ingestion
      const result = await ingestOpportunities(this.db, normalized);

      const durationSec = (performance.now() - startTime) / 1000;

      if (result.failures > 0) {
        status = 'degraded';
      }

      await logTelemetry(this.db, {
        id: adapter.sourceName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: adapter.sourceName,
        status,
        lastRun: new Date().toISOString(),
        ttfb_ms: ttfb,
        payloads_processed: result.processed,
        inserted: result.inserted,
        duplicates: result.duplicates,
        failures: result.failures,
        duration_sec: parseFloat(durationSec.toFixed(3)),
        error: result.errors.length > 0 ? result.errors.join('\n') : null,
        yield_quality: result.processed > 0 ? Math.round(((result.processed - result.failures) / result.processed) * 100) : 100,
        ops_per_hour: Math.round((result.inserted / durationSec) * 3600) || 0,
        proxyHealth: 'green'
      });
    } catch (err: any) {
      const durationSec = (performance.now() - startTime) / 1000;
      errorStack = err.stack || err.message || String(err);
      
      await logTelemetry(this.db, {
        id: adapter.sourceName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: adapter.sourceName,
        status: 'failed',
        lastRun: new Date().toISOString(),
        ttfb_ms: ttfb,
        payloads_processed: 0,
        inserted: 0,
        duplicates: 0,
        failures: 1,
        duration_sec: parseFloat(durationSec.toFixed(3)),
        error: errorStack,
        yield_quality: 0,
        ops_per_hour: 0,
        proxyHealth: 'red'
      });
      console.error(`[DNLDispatcher] Run failed for ${adapter.sourceName}:`, err);
    }
  }

  // Start periodic scraping runs (cron-job dispatcher)
  start(intervalMs: number = 3600000) {
    if (this.intervalId) return;
    
    console.log(`[DNLDispatcher] Scheduler started. Dispatching runs every ${intervalMs / 1000}s.`);
    this.intervalId = setInterval(() => {
      this.dispatchAll();
    }, intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[DNLDispatcher] Scheduler stopped.');
    }
  }

  private async dispatchAll() {
    console.log(`[DNLDispatcher] Cron trigger: Dispatching ${this.adapters.length} scraper run(s)...`);

    const results = await Promise.allSettled(
      this.adapters.map(async (adapter) => {
        const sourceName = adapter.sourceName;
        const configUrl = process.env[`SCRAPER_URL_${sourceName.toUpperCase()}`];

        if (configUrl) {
          console.log(`[DNLDispatcher] Running scraper for ${sourceName} via URL: ${configUrl}`);
          await this.runScrape(adapter, configUrl);
        } else {
          console.warn(`[DNLDispatcher] No SCRAPER_URL_${sourceName.toUpperCase()} configured. Skipping ${sourceName}.`);
        }
      })
    );

    const failed = results.filter(r => r.status === 'rejected').length;
    if (failed > 0) {
      console.error(`[DNLDispatcher] ${failed}/${this.adapters.length} scraper run(s) failed.`);
    } else {
      console.log(`[DNLDispatcher] All ${this.adapters.length} scraper run(s) completed.`);
    }
  }
}
