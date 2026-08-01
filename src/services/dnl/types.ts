import type { AdapterFailureDetails } from "./adapterError";

export interface NormalizedOpportunity {
  title: string;
  company: string;
  description: string;
  url: string;
  location: string;
  deadline: string;
  tags: string[];
  opportunityType: string;
  sourceName: string;
}

export interface IOpportunityAdapter {
  sourceName: string;
  normalize(rawPayload: unknown): NormalizedOpportunity[];
}

export interface AdapterRunResult {
  source: string;
  success: boolean;
  status: "healthy" | "degraded" | "failed";
  processed: number;
  inserted: number;
  duplicates: number;
  failures: number;
  durationMs: number;
  failure?: AdapterFailureDetails;
}

export interface AdapterBatchResult {
  total: number;
  succeeded: number;
  failed: number;
  results: AdapterRunResult[];
}

export interface ScraperMetrics {
  id: string;
  name: string;
  status: "healthy" | "degraded" | "failed";
  lastRun: string;
  ttfb_ms: number;
  payloads_processed: number;
  inserted: number;
  duplicates: number;
  failures: number;
  duration_sec: number;
  error: string | null;
  error_code?: string | null;
  error_stage?: string | null;
  retryable?: boolean;
  yield_quality: number;
  ops_per_hour: number;
  proxyHealth: "green" | "yellow" | "red";
}
