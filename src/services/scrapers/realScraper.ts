import * as cheerio from "cheerio";

export interface ScrapedOpportunity {
  title: string;
  company: string;
  description: string;
  url: string;
  sourceName: string;
  tags: string[];
  opportunityType: string;
  deadline: string;
  location: string;
}

function clean(value: string | undefined): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }

  return response.text();
}

function getMeta(
  $: cheerio.CheerioAPI,
  name: string
): string {
  return clean(
    $(`meta[name="${name}"]`).attr("content") ||
      $(`meta[property="${name}"]`).attr("content")
  );
}

async function scrapeDevpost(
  url: string,
  type: string
): Promise<ScrapedOpportunity[]> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const title =
    clean($("h1").first().text()) ||
    getMeta($, "og:title") ||
    "Untitled Hackathon";

  const description =
    getMeta($, "description") ||
    getMeta($, "og:description") ||
    clean($("main p").first().text()) ||
    "No description provided.";

  const organization =
    clean($(".challenge-company-name").first().text()) ||
    clean($('[class*="organization"]').first().text()) ||
    "Devpost";

  const deadline =
    clean($('[class*="deadline"]').first().text()) ||
    clean($('[class*="submission"]').first().text()) ||
    "";

  return [
    {
      title,
      company: organization,
      description,
      url,
      sourceName: "Devpost",
      tags: ["Hackathon", type],
      opportunityType: type || "hackathon",
      deadline,
      location: "Online",
    },
  ];
}

async function scrapeDevfolio(
  url: string,
  type: string
): Promise<ScrapedOpportunity[]> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const title =
    clean($("h1").first().text()) ||
    getMeta($, "og:title") ||
    "Untitled Hackathon";

  const description =
    getMeta($, "description") ||
    getMeta($, "og:description") ||
    clean($("main p").first().text()) ||
    "No description provided.";

  const organization =
    clean($('[class*="organizer"]').first().text()) ||
    clean($('[class*="host"]').first().text()) ||
    "Devfolio";

  const deadline =
    clean($('[class*="deadline"]').first().text()) ||
    clean($('[class*="submission"]').first().text()) ||
    "";

  return [
    {
      title,
      company: organization,
      description,
      url,
      sourceName: "Devfolio",
      tags: ["Hackathon", type],
      opportunityType: type || "hackathon",
      deadline,
      location: "Online",
    },
  ];
}

async function scrapeInternshala(
  url: string,
  type: string
): Promise<ScrapedOpportunity[]> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const title =
    clean($("h1").first().text()) ||
    getMeta($, "og:title") ||
    "Untitled Internship";

  const description =
    getMeta($, "description") ||
    getMeta($, "og:description") ||
    clean($("main p").first().text()) ||
    "No description provided.";

  const company =
    clean($('[class*="company-name"]').first().text()) ||
    clean($('[class*="company"]').first().text()) ||
    "Internshala";

  const location =
    clean($('[class*="location"]').first().text()) ||
    "Remote";

  const deadline =
    clean($('[class*="deadline"]').first().text()) || "";

  return [
    {
      title,
      company,
      description,
      url,
      sourceName: "Internshala",
      tags: ["Internship", type],
      opportunityType: type || "internship",
      deadline,
      location,
    },
  ];
}

export async function scrapeOpportunity(
  domain: string,
  url: string,
  type: string
): Promise<ScrapedOpportunity[]> {
  const normalizedDomain = domain.toLowerCase();

  if (normalizedDomain.includes("devpost.com")) {
    return scrapeDevpost(url, type);
  }

  if (normalizedDomain.includes("devfolio.co")) {
    return scrapeDevfolio(url, type);
  }

  if (normalizedDomain.includes("internshala.com")) {
    return scrapeInternshala(url, type);
  }

  throw new Error(`Unsupported scraper domain: ${domain}`);
}