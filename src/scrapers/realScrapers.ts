import crypto from "crypto";

export interface ScrapedOpportunityData {
  title: string;
  organization: string;
  apply_link: string;
  tags: string[];
  deadline: string;
  location: string;
  opportunity_type: string;
  description: string;
  source_name: string;
}

/**
 * Fetch and extract real opportunity listings from Devpost RSS/web feed.
 */
export async function scrapeDevpostReal(): Promise<ScrapedOpportunityData[]> {
  const results: ScrapedOpportunityData[] = [];
  try {
    const res = await fetch("https://devpost.com/rss", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
    });
    if (!res.ok) {
      console.warn(`[DevpostScraper] HTTP ${res.status} ${res.statusText}`);
      return results;
    }
    const text = await res.text();
    const itemMatches = text.match(/<item>[\s\S]*?<\/item>/gi) || [];
    
    for (const item of itemMatches) {
      const titleMatch = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const linkMatch = item.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
      const descMatch = item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
      const pubDateMatch = item.match(/<pubDate>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i);

      const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      const apply_link = linkMatch ? linkMatch[1].trim() : '';
      const rawDesc = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      
      if (title && apply_link) {
        results.push({
          title,
          organization: "Devpost Community",
          apply_link,
          tags: ["Hackathon", "Devpost", "Code"],
          deadline: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date(Date.now() + 14 * 86400000).toISOString(),
          location: "Global / Online",
          opportunity_type: "hackathon",
          description: rawDesc.substring(0, 300) || "Hackathon hosted on Devpost.",
          source_name: "Devpost"
        });
      }
    }
  } catch (err: any) {
    console.error("[DevpostScraper] Scraping failed gracefully:", err.message);
  }
  return results;
}

/**
 * Fetch and extract real opportunity listings from MLH (Major League Hacking).
 */
export async function scrapeMLHReal(): Promise<ScrapedOpportunityData[]> {
  const results: ScrapedOpportunityData[] = [];
  try {
    const res = await fetch("https://mlh.io/seasons/2026/events", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
    });
    if (!res.ok) {
      console.warn(`[MLHScraper] HTTP ${res.status} ${res.statusText}`);
      return results;
    }
    const html = await res.text();
    const eventRegex = /<div class="event[\s\S]*?<h3 class="event-name">([\s\S]*?)<\/h3>[\s\S]*?<a href="([\s\S]*?)"/gi;
    let match;
    while ((match = eventRegex.exec(html)) !== null) {
      const title = match[1].replace(/<[^>]+>/g, '').trim();
      const apply_link = match[2].trim();
      if (title && apply_link) {
        results.push({
          title,
          organization: "Major League Hacking (MLH)",
          apply_link,
          tags: ["MLH", "Student", "Hackathon"],
          deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
          location: "Global / Hybrid",
          opportunity_type: "hackathon",
          description: `Official MLH Season Hackathon: ${title}`,
          source_name: "MLH"
        });
      }
    }
  } catch (err: any) {
    console.error("[MLHScraper] Scraping failed gracefully:", err.message);
  }
  return results;
}

/**
 * Fetch real webpage content for a target URL and extract normalized metadata.
 */
export async function scrapeRealURL(url: string, domain: string, type: string): Promise<ScrapedOpportunityData | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
    });
    if (!res.ok) {
      console.warn(`[RealScraper] Failed to fetch ${url}: HTTP ${res.status}`);
      return null;
    }
    const html = await res.text();
    
    // Extract title from og:title, twitter:title, or <title>
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = (ogTitleMatch ? ogTitleMatch[1] : (titleMatch ? titleMatch[1] : "")).trim();

    // Extract description from og:description or meta description
    const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    const description = (ogDescMatch ? ogDescMatch[1] : (descMatch ? descMatch[1] : "Real opportunity extracted from source URL.")).trim();

    // Extract company / organization from og:site_name or domain
    const siteNameMatch = html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i);
    const organization = siteNameMatch ? siteNameMatch[1].trim() : domain;

    if (!title) {
      console.warn(`[RealScraper] Could not parse title from ${url}`);
      return null;
    }

    return {
      title,
      organization,
      apply_link: url,
      tags: ["RealData", domain, type],
      deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
      location: "Online",
      opportunity_type: type || "hackathon",
      description: description.substring(0, 500),
      source_name: domain
    };
  } catch (err: any) {
    console.error(`[RealScraper] Scraping ${url} failed gracefully:`, err.message);
    return null;
  }
}
