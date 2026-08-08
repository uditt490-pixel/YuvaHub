import { IScraperAdapter, ScrapedOpportunity } from './types.js';
import { DevpostAdapter } from './DevpostAdapter.js';
import { UnstopAdapter } from './UnstopAdapter.js';
import { MLHAdapter } from './MLHAdapter.js';
import { KaggleAdapter } from './KaggleAdapter.js';
import { AICTEAdapter } from './AICTEAdapter.js';

export class AdapterRegistry {
  private adapters: Map<string, IScraperAdapter> = new Map();

  constructor() {
    // Default dynamic registration of supported adapters
    this.register(new DevpostAdapter());
    this.register(new UnstopAdapter());
    this.register(new MLHAdapter());
    this.register(new KaggleAdapter());
    this.register(new AICTEAdapter());
  }

  register(adapter: IScraperAdapter): void {
    this.adapters.set(adapter.sourceName.toLowerCase(), adapter);
    console.log(`[AdapterRegistry] Registered scraper adapter: ${adapter.sourceName}`);
  }

  getAdapter(sourceName: string): IScraperAdapter | undefined {
    return this.adapters.get(sourceName.toLowerCase());
  }

  getAllAdapters(): IScraperAdapter[] {
    return Array.from(this.adapters.values());
  }

  async runSource(sourceName: string): Promise<ScrapedOpportunity[]> {
    const adapter = this.getAdapter(sourceName);
    if (!adapter) {
      throw new Error(`No scraper adapter registered for source: ${sourceName}`);
    }
    return await adapter.scrape();
  }

  async runAll(): Promise<Record<string, ScrapedOpportunity[]>> {
    const results: Record<string, ScrapedOpportunity[]> = {};
    for (const [key, adapter] of this.adapters.entries()) {
      try {
        results[adapter.sourceName] = await adapter.scrape();
      } catch (err: any) {
        console.error(`[AdapterRegistry] Failed running adapter ${adapter.sourceName}:`, err.message);
        results[adapter.sourceName] = [];
      }
    }
    return results;
  }
}

export const globalAdapterRegistry = new AdapterRegistry();
