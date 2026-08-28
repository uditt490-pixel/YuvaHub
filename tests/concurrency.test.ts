import { describe, expect, it } from "vitest";
import {
  getConcurrencyLimit,
  runWithConcurrency,
} from "../src/lib/runWithConcurrency";

describe("runWithConcurrency", () => {
  it("uses the configured concurrency limit", async () => {
    let active = 0;
    let peak = 0;

    const summary = await runWithConcurrency(
      Array.from({ length: 20 }, (_, i) => i),
      async () => {
        active += 1;
        peak = Math.max(peak, active);
        await new Promise((resolve) => setTimeout(resolve, 5));
        active -= 1;
      },
      5,
    );

    expect(peak).toBeLessThanOrEqual(5);
    expect(summary.succeeded).toBe(20);
    expect(summary.failed).toBe(0);
  });

  it("continues after individual failures", async () => {
    const summary = await runWithConcurrency(
      [1, 2, 3, 4],
      async (value) => {
        if (value === 2 || value === 4) throw new Error(`failed-${value}`);
      },
      2,
    );

    expect(summary.succeeded).toBe(2);
    expect(summary.failed).toBe(2);
    expect(summary.failures).toHaveLength(2);
    expect(summary.failures.map((failure) => failure.index)).toEqual([1, 3]);
  });

  it("falls back to five for invalid values", () => {
    expect(getConcurrencyLimit(undefined)).toBe(5);
    expect(getConcurrencyLimit("not-a-number")).toBe(5);
    expect(getConcurrencyLimit("0")).toBe(5);
    expect(getConcurrencyLimit("-2")).toBe(5);
    expect(getConcurrencyLimit("5")).toBe(5);
    expect(getConcurrencyLimit("101")).toBe(5);
  });

  it("never creates more workers than there are items", async () => {
    let calls = 0;
    const summary = await runWithConcurrency(
      [1, 2],
      async () => {
        calls += 1;
      },
      10,
    );

    expect(calls).toBe(2);
    expect(summary.succeeded).toBe(2);
  });
});
