import { describe, it, expect } from 'vitest';
import { scrapeDevpostReal, scrapeMLHReal, scrapeRealURL } from '../src/scrapers/realScrapers.js';

describe('Real Source Scrapers (#581)', () => {
  it('should scrape Devpost real opportunities or fail gracefully without throwing', async () => {
    const opps = await scrapeDevpostReal();
    expect(Array.isArray(opps)).toBe(true);
    opps.forEach(o => {
      expect(o.source_name).toBe('Devpost');
      expect(o.title).toBeTruthy();
      expect(o.apply_link).toBeTruthy();
    });
  });

  it('should scrape MLH real opportunities or fail gracefully', async () => {
    const opps = await scrapeMLHReal();
    expect(Array.isArray(opps)).toBe(true);
  });

  it('should handle invalid target URLs gracefully', async () => {
    const result = await scrapeRealURL('https://invalid-non-existent-domain-xyz.com', 'test', 'hackathon');
    expect(result).toBeNull();
  });
});
