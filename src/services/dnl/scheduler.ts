import { logger } from "../../lib/logger.js";
import { createBreaker } from "../circuitBreaker";
import { AdapterError, toAdapterError } from "./adapterError";
import { ingestOpportunities } from "./deduplicator";
import { logTelemetry } from "./metrics";
import type {
  AdapterBatchResult,
  AdapterRunResult,
  IOpportunityAdapter,
} from "./types";

type BreakerFetchResult = {
  text: string;
  ttfb: number;
  fallbackError?: string;
};

export class DNLDispatcher {
  private readonly db: any;
  private readonly adapters: IOpportunityAdapter[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private readonly breakers: Record<string, any> = {};

  constructor(db: any) {
    this.db = db;
  }

  registerAdapter(adapter: IOpportunityAdapter): void {
    this.adapters.push(adapter);
  }

  private getBreaker(sourceName: string) {
    if (!this.breakers[sourceName]) {
      const fetchCb = async (url: string): Promise<BreakerFetchResult> => {
        const fetchStart = performance.now();
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `HTTP request failed with status ${response.status}.`,
          );
        }

        const text = await response.text();
        return {
          text,
          ttfb: Math.round(performance.now() - fetchStart),
        };
      };

      const breaker = createBreaker(
        fetchCb,
        {
          timeout: 10_000,
          errorThresholdPercentage: 50,
          resetTimeout: 30_000,
        },
        sourceName,
      );

      breaker.fallback((_url: string, error: unknown) => ({
        text: "[]",
        ttfb: 0,
        fallbackError:
          error instanceof Error
            ? error.message
            : "Circuit breaker fallback used.",
      }));

      this.breakers[sourceName] = breaker;
    }

    return this.breakers[sourceName];
  }

  async runScrape(
    adapter: IOpportunityAdapter,
    fetchUrlOrPayload: string | unknown[],
  ): Promise<AdapterRunResult> {
    const startTime = performance.now();
    let ttfb = 0;

    try {
      let rawPayload: unknown;

      if (typeof fetchUrlOrPayload === "string") {
        const result = (await this.getBreaker(adapter.sourceName).fire(
          fetchUrlOrPayload,
        )) as BreakerFetchResult;

        ttfb = result.ttfb;

        if (result.fallbackError) {
          throw new AdapterError({
            source: adapter.sourceName,
            stage: "fetch",
            code: "FETCH_FAILED",
            message: result.fallbackError,
            retryable: true,
          });
        }

        try {
          rawPayload = JSON.parse(result.text);
        } catch (error) {
          throw new AdapterError({
            source: adapter.sourceName,
            stage: "parse",
            code: "INVALID_JSON",
            message: "Adapter endpoint returned invalid JSON.",
            retryable: true,
            cause: error,
          });
        }
      } else {
        rawPayload = fetchUrlOrPayload;
      }

      const normalized = adapter.normalize(rawPayload);
      const ingestion = await ingestOpportunities(this.db, normalized);
      const durationMs = Math.round(performance.now() - startTime);
      const status = ingestion.failures > 0 ? "degraded" : "healthy";

      await logTelemetry(this.db, {
        id: this.telemetryId(adapter.sourceName),
        name: adapter.sourceName,
        status,
        lastRun: new Date().toISOString(),
        ttfb_ms: ttfb,
        payloads_processed: ingestion.processed,
        inserted: ingestion.inserted,
        duplicates: ingestion.duplicates,
        failures: ingestion.failures,
        duration_sec: durationMs / 1000,
        error:
          ingestion.errors.length > 0
            ? ingestion.errors.join("\n").slice(0, 2000)
            : null,
        error_code: ingestion.failures > 0 ? "INGESTION_FAILED" : null,
        error_stage: ingestion.failures > 0 ? "ingest" : null,
        retryable: ingestion.failures > 0,
        yield_quality:
          ingestion.processed > 0
            ? Math.round(
                ((ingestion.processed - ingestion.failures) /
                  ingestion.processed) *
                  100,
              )
            : 100,
        ops_per_hour:
          durationMs > 0
            ? Math.round((ingestion.inserted / durationMs) * 3_600_000)
            : 0,
        proxyHealth: status === "healthy" ? "green" : "yellow",
      });

      return {
        source: adapter.sourceName,
        success: true,
        status,
        processed: ingestion.processed,
        inserted: ingestion.inserted,
        duplicates: ingestion.duplicates,
        failures: ingestion.failures,
        durationMs,
      };
    } catch (error) {
      const adapterError = toAdapterError(
        adapter.sourceName,
        "normalize",
        error,
        "NORMALIZATION_FAILED",
      );
      const failure = adapterError.toFailureDetails();
      const durationMs = Math.round(performance.now() - startTime);

      await logTelemetry(this.db, {
        id: this.telemetryId(adapter.sourceName),
        name: adapter.sourceName,
        status: "failed",
        lastRun: new Date().toISOString(),
        ttfb_ms: ttfb,
        payloads_processed: 0,
        inserted: 0,
        duplicates: 0,
        failures: 1,
        duration_sec: durationMs / 1000,
        error: failure.message,
        error_code: failure.code,
        error_stage: failure.stage,
        retryable: failure.retryable,
        yield_quality: 0,
        ops_per_hour: 0,
        proxyHealth: "red",
      });

      logger.error(
        `[DNLDispatcher] ${failure.source} failed during ${failure.stage} (${failure.code}): ${failure.message}`,
      );

      return {
        source: adapter.sourceName,
        success: false,
        status: "failed",
        processed: 0,
        inserted: 0,
        duplicates: 0,
        failures: 1,
        durationMs,
        failure,
      };
    }
  }

  async runAdapters(
    tasks: Array<{
      adapter: IOpportunityAdapter;
      input: string | unknown[];
    }>,
  ): Promise<AdapterBatchResult> {
    const settled = await Promise.all(
      tasks.map(({ adapter, input }) => this.runScrape(adapter, input)),
    );

    return {
      total: settled.length,
      succeeded: settled.filter((result) => result.success).length,
      failed: settled.filter((result) => !result.success).length,
      results: settled,
    };
  }

  start(intervalMs = 3_600_000): void {
    if (this.intervalId) return;

    logger.info(
      `[DNLDispatcher] Scheduler started. Dispatching every ${intervalMs / 1000}s.`,
    );

    this.intervalId = setInterval(() => {
      void this.dispatchAll();
    }, intervalMs);
  }

  stop(): void {
    if (!this.intervalId) return;

    clearInterval(this.intervalId);
    this.intervalId = null;
    logger.info("[DNLDispatcher] Scheduler stopped.");
  }

  private async dispatchAll(): Promise<void> {
    const tasks = this.adapters.flatMap((adapter) => {
      const environmentKey = `SCRAPER_URL_${adapter.sourceName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "_")}`;
      const configuredUrl = process.env[environmentKey];

      if (!configuredUrl) {
        logger.warn(
          `[DNLDispatcher] ${environmentKey} is not configured. Skipping ${adapter.sourceName}.`,
        );
        return [];
      }

      return [{ adapter, input: configuredUrl }];
    });

    const summary = await this.runAdapters(tasks);

    if (summary.failed > 0) {
      logger.error(
        `[DNLDispatcher] Completed with ${summary.failed}/${summary.total} adapter failure(s).`,
      );
    } else {
      logger.info(
        `[DNLDispatcher] All ${summary.succeeded} configured adapter run(s) completed.`,
      );
    }
  }

  private telemetryId(sourceName: string): string {
    return sourceName.toLowerCase().replace(/[^a-z0-9]/g, "_");
  }
}
