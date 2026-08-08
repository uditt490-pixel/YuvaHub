import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/services/dnl/deduplicator", () => ({
  ingestOpportunities: vi.fn(async (_db, opportunities) => ({
    processed: opportunities.length,
    inserted: opportunities.length,
    duplicates: 0,
    failures: 0,
    errors: [],
  })),
}));

vi.mock("../src/services/dnl/metrics", () => ({
  logTelemetry: vi.fn(async () => undefined),
}));

import { AdapterError } from "../src/services/dnl/adapterError";
import { DevpostAdapter } from "../src/services/dnl/adapters/DevpostAdapter";
import { InternshalaAdapter } from "../src/services/dnl/adapters/InternshalaAdapter";
import { DNLDispatcher } from "../src/services/dnl/scheduler";
import type {
  IOpportunityAdapter,
  NormalizedOpportunity,
} from "../src/services/dnl/types";
import { logTelemetry } from "../src/services/dnl/metrics";

const mockedLogTelemetry = vi.mocked(logTelemetry);

describe("DNL adapter reliability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes valid Devpost and Internshala payloads", () => {
    expect(
      new DevpostAdapter().normalize({
        title: "Build Challenge",
        organization: "Example",
        apply_link: "https://example.test/apply",
      }),
    ).toHaveLength(1);

    expect(
      new InternshalaAdapter().normalize({
        title: "Backend Internship",
        company: "Example",
        link: "https://example.test/internship",
      }),
    ).toHaveLength(1);
  });

  it("returns a structured adapter error for invalid payloads", () => {
    expect(() => new DevpostAdapter().normalize([])).toThrow(AdapterError);

    try {
      new DevpostAdapter().normalize([]);
    } catch (error) {
      const failure = (error as AdapterError).toFailureDetails();
      expect(failure).toEqual(
        expect.objectContaining({
          source: "Devpost",
          stage: "normalize",
          code: "INVALID_PAYLOAD",
          retryable: false,
        }),
      );
    }
  });

  it("keeps successful adapters running when another adapter fails", async () => {
    const failingAdapter: IOpportunityAdapter = {
      sourceName: "BrokenPlatform",
      normalize(): NormalizedOpportunity[] {
        throw new Error("selector no longer matches");
      },
    };

    const dispatcher = new DNLDispatcher({});
    const summary = await dispatcher.runAdapters([
      {
        adapter: failingAdapter,
        input: [{ unexpected: true }],
      },
      {
        adapter: new DevpostAdapter(),
        input: [
          {
            title: "Working Opportunity",
            organization: "Example",
            apply_link: "https://example.test/apply",
          },
        ],
      },
    ]);

    expect(summary.total).toBe(2);
    expect(summary.failed).toBe(1);
    expect(summary.succeeded).toBe(1);
    expect(summary.results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "BrokenPlatform",
          success: false,
          status: "failed",
        }),
        expect.objectContaining({
          source: "Devpost",
          success: true,
          status: "healthy",
        }),
      ]),
    );

    expect(mockedLogTelemetry).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        name: "BrokenPlatform",
        status: "failed",
        error_code: "NORMALIZATION_FAILED",
        error_stage: "normalize",
      }),
    );
  });

  it("redacts URLs and secrets from failure details", () => {
    const error = new AdapterError({
      source: "Example",
      stage: "fetch",
      code: "FETCH_FAILED",
      message:
        "Failed https://example.test/path?api_key=secret-value token=abc123",
      retryable: true,
    });

    const failure = error.toFailureDetails();
    expect(failure.message).not.toContain("secret-value");
    expect(failure.message).not.toContain("abc123");
    expect(failure.message).not.toContain("https://example.test");
  });
});
