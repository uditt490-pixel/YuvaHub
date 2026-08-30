export const DEFAULT_SITEMAP_TTL_SECONDS = 900;
export const MAX_SITEMAP_URLS = 50_000;

export interface SitemapOpportunity {
  id?: string;
  _id?: { toString(): string };
  updated_at?: string | Date;
  created_at?: string | Date;
}

export interface SitemapDatabase {
  collection(name: string): {
    find(query: Record<string, unknown>, options?: Record<string, unknown>): {
      project(projection: Record<string, number>): {
        sort(sort: Record<string, 1 | -1>): {
          limit(limit: number): {
            toArray(): Promise<SitemapOpportunity[]>;
          };
        };
      };
    };
  };
}

export interface SitemapCacheEntry {
  xml: string;
  etag: string;
  lastModified: string;
  expiresAt: number;
}

export interface SitemapResult {
  status: 200 | 304;
  xml?: string;
  etag: string;
  lastModified: string;
  cacheControl: string;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stableId(opportunity: SitemapOpportunity): string | null {
  if (opportunity.id) return opportunity.id;
  if (opportunity._id) return opportunity._id.toString();
  return null;
}

function toLastModified(value: string | Date | undefined): Date {
  const date = value ? new Date(value) : new Date(0);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function makeEtag(xml: string): string {
  // Stable, dependency-free FNV-1a hash. This is an entity tag, not a security hash.
  let hash = 2166136261;
  for (let i = 0; i < xml.length; i += 1) {
    hash ^= xml.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `"sitemap-${(hash >>> 0).toString(16)}"`;
}

export function buildSitemapXml(
  opportunities: SitemapOpportunity[],
  baseUrl: string,
): { xml: string; lastModified: string } {
  const rows = opportunities
    .map((item) => {
      const id = stableId(item);
      if (!id) return null;
      const updated = toLastModified(item.updated_at ?? item.created_at);
      return {
        id,
        updated: updated.toISOString(),
      };
    })
    .filter((row): row is { id: string; updated: string } => row !== null)
    .sort((a, b) => a.id.localeCompare(b.id));

  const lastModified = rows.reduce(
    (latest, row) => (row.updated > latest ? row.updated : latest),
    new Date(0).toISOString(),
  );

  const urls = rows.map(
    (row) =>
      `  <url><loc>${escapeXml(`${baseUrl.replace(/\/$/, "")}/opportunity/${encodeURIComponent(row.id)}`)}</loc><lastmod>${row.updated}</lastmod></url>`,
  );

  return {
    xml: [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls,
      "</urlset>",
    ].join("\n"),
    lastModified,
  };
}

export class SitemapService {
  private cache: SitemapCacheEntry | null = null;

  constructor(
    private readonly db: SitemapDatabase,
    private readonly ttlSeconds = DEFAULT_SITEMAP_TTL_SECONDS,
    private readonly maxUrls = MAX_SITEMAP_URLS,
  ) {}

  async getSitemap(
    baseUrl: string,
    now = Date.now(),
    ifNoneMatch?: string,
  ): Promise<SitemapResult> {
    const cacheControl = `public, max-age=${Math.max(0, Math.floor(this.ttlSeconds))}`;

    if (this.cache && this.cache.expiresAt > now) {
      if (ifNoneMatch === this.cache.etag) {
        return {
          status: 304,
          etag: this.cache.etag,
          lastModified: this.cache.lastModified,
          cacheControl,
        };
      }
      return { status: 200, ...this.cache, cacheControl };
    }

    try {
      const records = await this.db
        .collection("opportunities")
        .find({}, { projection: { id: 1, _id: 1, updated_at: 1, created_at: 1 } })
        .project({ id: 1, _id: 1, updated_at: 1, created_at: 1 })
        .sort({ id: 1, _id: 1 })
        .limit(this.maxUrls)
        .toArray();

      const { xml, lastModified } = buildSitemapXml(records, baseUrl);
      const etag = makeEtag(xml);

      this.cache = {
        xml,
        etag,
        lastModified,
        expiresAt: now + this.ttlSeconds * 1000,
      };

      if (ifNoneMatch === etag) {
        return { status: 304, etag, lastModified, cacheControl };
      }

      return { status: 200, xml, etag, lastModified, cacheControl };
    } catch (error) {
      if (this.cache) {
        if (ifNoneMatch === this.cache.etag) {
          return {
            status: 304,
            etag: this.cache.etag,
            lastModified: this.cache.lastModified,
            cacheControl,
          };
        }
        return { status: 200, ...this.cache, cacheControl };
      }
      throw error;
    }
  }
}
