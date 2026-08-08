import { describe, it, expect } from 'vitest';
import { 
  AdapterRegistry, 
  globalAdapterRegistry,
  DevpostAdapter, 
  UnstopAdapter, 
  MLHAdapter, 
  KaggleAdapter, 
  AICTEAdapter 
} from '../src/scrapers/adapters/index.js';

describe('Source-wise Scraper Adapters (#584)', () => {
  it('should register all default source adapters dynamically', () => {
    const adapters = globalAdapterRegistry.getAllAdapters();
    expect(adapters.length).toBeGreaterThanOrEqual(5);

    const names = adapters.map(a => a.sourceName);
    expect(names).toContain('Devpost');
    expect(names).toContain('Unstop');
    expect(names).toContain('MLH');
    expect(names).toContain('Kaggle');
    expect(names).toContain('AICTE');
  });

  it('should retrieve individual adapters correctly', () => {
    const devpost = globalAdapterRegistry.getAdapter('devpost');
    expect(devpost).toBeInstanceOf(DevpostAdapter);

    const unstop = globalAdapterRegistry.getAdapter('Unstop');
    expect(unstop).toBeInstanceOf(UnstopAdapter);
  });

  it('should allow dynamic registration of custom adapters', async () => {
    const customRegistry = new AdapterRegistry();
    const mockAdapter = {
      sourceName: 'CustomPlatform',
      baseUrl: 'https://custom.org',
      scrape: async () => [{
        title: 'Custom Opportunity',
        organization: 'Custom Org',
        applyLink: 'https://custom.org/apply',
        tags: ['Custom'],
        deadline: '2026-12-31T00:00:00Z',
        location: 'Online',
        opportunityType: 'hackathon',
        description: 'Test description',
        sourceName: 'CustomPlatform',
      }],
      validate: (opp: any) => Boolean(opp.title),
    };

    customRegistry.register(mockAdapter);
    const retrieved = customRegistry.getAdapter('customplatform');
    expect(retrieved?.sourceName).toBe('CustomPlatform');

    const scraped = await customRegistry.runSource('CustomPlatform');
    expect(scraped.length).toBe(1);
    expect(scraped[0].title).toBe('Custom Opportunity');
  });
});
