import { describe, expect, it, vi } from "vitest";
import {
  MAX_SITEMAP_URLS,
  SitemapService,
  buildSitemapXml,
} from "../src/services/sitemapService";
import { getCacheTtlSeconds } from "../src/lib/cacheTtl";

function mockDb(records: any[]) {
  const toArray = vi.fn().mockResolvedValue(records);
  const chain = {
    project: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    toArray,
  };
  return {
    db: { collection: vi.fn().mockReturnValue({ find: vi.fn().mockReturnValue(chain) }) },
    toArray,
  };
}

describe("sitemap service", () => {
  it("builds deterministic URLs", () => {
    const a = buildSitemapXml(
      [{ id: "b" }, { id: "a" }],
      "https://example.com",
    ).xml;
    const b = buildSitemapXml(
      [{ id: "a" }, { id: "b" }],
      "https://example.com",
    ).xml;
    expect(a).toBe(b);
  });

  it("caches repeated requests inside the TTL", async () => {
    const { db, toArray } = mockDb([{ id: "1" }]);
    const service = new SitemapService(db as any, 900);

    await service.getSitemap("https://example.com", 1000);
    await service.getSitemap("https://example.com", 1001);

    expect(toArray).toHaveBeenCalledTimes(1);
  });

  it("refreshes after cache expiry", async () => {
    const { db, toArray } = mockDb([{ id: "1" }]);
    const service = new SitemapService(db as any, 900);

    await service.getSitemap("https://example.com", 1000);
    await service.getSitemap("https://example.com", 901_001);

    expect(toArray).toHaveBeenCalledTimes(2);
  });

  it("returns 304 for a matching ETag", async () => {
    const { db } = mockDb([{ id: "1" }]);
    const service = new SitemapService(db as any, 900);

    const first = await service.getSitemap("https://example.com", 1000);
    const second = await service.getSitemap(
      "https://example.com",
      1001,
      first.etag,
    );

    expect(second.status).toBe(304);
    expect(second.xml).toBeUndefined();
  });

  it("serves the last valid sitemap after a temporary database failure", async () => {
    const toArray = vi
      .fn()
      .mockResolvedValueOnce([{ id: "1" }])
      .mockRejectedValueOnce(new Error("database unavailable"));

    const chain = {
      project: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      toArray,
    };
    const db = {
      collection: vi.fn().mockReturnValue({
        find: vi.fn().mockReturnValue(chain),
      }),
    };

    const service = new SitemapService(db as any, 900);
    const first = await service.getSitemap("https://example.com", 1000);
    const fallback = await service.getSitemap("https://example.com", 901_001);

    expect(fallback.status).toBe(200);
    expect(fallback.etag).toBe(first.etag);
    expect(fallback.xml).toBe(first.xml);
  });

  it("limits database reads to the documented sitemap URL maximum", async () => {
    const { db } = mockDb([]);
    const service = new SitemapService(db as any);

    await service.getSitemap("https://example.com", 1000);

    const chain = (db.collection("opportunities").find as any).mock.results[0].value;
    expect(chain.limit).toHaveBeenCalledWith(MAX_SITEMAP_URLS);
  });

  it("validates the configurable TTL", () => {
    expect(getCacheTtlSeconds("900")).toBe(900);
    expect(getCacheTtlSeconds("invalid")).toBe(900);
    expect(getCacheTtlSeconds("-1")).toBe(900);
    expect(getCacheTtlSeconds("90000")).toBe(900);
  });
});
