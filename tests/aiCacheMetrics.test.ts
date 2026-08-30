import { describe, expect, it, vi } from "vitest";
import { AICacheMetrics } from "../src/api/services/aiCacheMetrics";

describe("AICacheMetrics", () => {
  it("starts with zero counters", () => {
    const metrics = new AICacheMetrics();
    const cache = new Map<string, unknown>();

    expect(metrics.totalLookups).toBe(0);
    expect(metrics.hitRatio).toBe(0);

    const snap = metrics.snapshot(cache);
    expect(snap.hits).toBe(0);
    expect(snap.misses).toBe(0);
    expect(snap.totalLookups).toBe(0);
    expect(snap.hitRatio).toBe(0);
    expect(snap.cacheSize).toBe(0);
    expect(snap.evictions).toBe(0);
    expect(snap.estimatedMemoryBytes).toBe(0);
  });

  it("increments hits on recordHit", () => {
    const metrics = new AICacheMetrics();

    metrics.recordHit();
    metrics.recordHit();
    metrics.recordHit();

    expect(metrics.totalLookups).toBe(3);
  });

  it("increments misses on recordMiss", () => {
    const metrics = new AICacheMetrics();

    metrics.recordMiss();
    metrics.recordMiss();

    expect(metrics.totalLookups).toBe(2);
  });

  it("increments evictions on recordEviction", () => {
    const metrics = new AICacheMetrics();

    metrics.recordEviction();
    metrics.recordEviction();
    metrics.recordEviction();

    const snap = metrics.snapshot(new Map());
    expect(snap.evictions).toBe(3);
  });

  it("computes hit ratio correctly", () => {
    const metrics = new AICacheMetrics();

    // 3 hits + 1 miss = 75% hit ratio
    metrics.recordHit();
    metrics.recordHit();
    metrics.recordHit();
    metrics.recordMiss();

    expect(metrics.hitRatio).toBeCloseTo(0.75, 4);
    expect(metrics.totalLookups).toBe(4);
  });

  it("returns 0 hit ratio when no lookups have occurred", () => {
    const metrics = new AICacheMetrics();
    expect(metrics.hitRatio).toBe(0);
  });

  it("reports cache size from the provided Map", () => {
    const metrics = new AICacheMetrics();
    const cache = new Map<string, unknown>();
    cache.set("key1", { data: "value1", timestamp: Date.now() });
    cache.set("key2", { data: "value2", timestamp: Date.now() });

    const snap = metrics.snapshot(cache);
    expect(snap.cacheSize).toBe(2);
  });

  it("estimates memory usage based on cache contents", () => {
    const metrics = new AICacheMetrics();
    const cache = new Map<string, unknown>();
    cache.set("test-key", { data: "test value with some content", timestamp: Date.now() });

    const snap = metrics.snapshot(cache);
    expect(snap.estimatedMemoryBytes).toBeGreaterThan(0);
  });

  it("estimates higher memory for larger cache entries", () => {
    const metrics = new AICacheMetrics();
    const smallCache = new Map<string, unknown>();
    smallCache.set("k", { data: "small" });

    const largeCache = new Map<string, unknown>();
    largeCache.set("k", {
      data: "a".repeat(10000),
      timestamp: Date.now(),
    });

    const smallSnap = metrics.snapshot(smallCache);
    const largeSnap = metrics.snapshot(largeCache);

    expect(largeSnap.estimatedMemoryBytes).toBeGreaterThan(
      smallSnap.estimatedMemoryBytes,
    );
  });

  it("includes a valid ISO timestamp in snapshot", () => {
    const metrics = new AICacheMetrics();
    const snap = metrics.snapshot(new Map());

    expect(snap.timestamp).toBeDefined();
    expect(new Date(snap.timestamp).toISOString()).toBe(snap.timestamp);
  });

  it("reset clears all counters", () => {
    const metrics = new AICacheMetrics();

    metrics.recordHit();
    metrics.recordHit();
    metrics.recordMiss();
    metrics.recordEviction();

    metrics.reset();

    expect(metrics.totalLookups).toBe(0);
    expect(metrics.hitRatio).toBe(0);

    const snap = metrics.snapshot(new Map());
    expect(snap.hits).toBe(0);
    expect(snap.misses).toBe(0);
    expect(snap.evictions).toBe(0);
  });

  it("snapshot hitRatio is rounded to 4 decimal places", () => {
    const metrics = new AICacheMetrics();

    // 1 hit + 3 misses = 0.25
    metrics.recordHit();
    metrics.recordMiss();
    metrics.recordMiss();
    metrics.recordMiss();

    const snap = metrics.snapshot(new Map());
    expect(snap.hitRatio).toBe(0.25);
  });

  it("handles many hits and misses without overflow", () => {
    const metrics = new AICacheMetrics();

    for (let i = 0; i < 100000; i++) {
      metrics.recordHit();
    }
    for (let i = 0; i < 50000; i++) {
      metrics.recordMiss();
    }

    expect(metrics.totalLookups).toBe(150000);
    expect(metrics.hitRatio).toBeCloseTo(2 / 3, 4);
  });

  it("works with a cache that has a mix of entry types", () => {
    const metrics = new AICacheMetrics();
    const cache = new Map<string, unknown>();
    cache.set("prompt-1", { data: "response text", timestamp: Date.now() });
    cache.set("resume:abc", { score: 85, strengths: [] });
    cache.set("analysis:xyz", { score: 72, missingKeywords: ["TypeScript"] });

    const snap = metrics.snapshot(cache);
    expect(snap.cacheSize).toBe(3);
    expect(snap.estimatedMemoryBytes).toBeGreaterThan(0);
  });
});

describe("AICacheMetrics endpoint", () => {
  it("returns cache metrics as JSON with correct structure", async () => {
    // We test the endpoint structure by importing the snapshot type
    // and verifying the shape matches what the endpoint would return
    const metrics = new AICacheMetrics();
    metrics.recordHit();
    metrics.recordHit();
    metrics.recordMiss();

    const cache = new Map<string, unknown>();
    cache.set("test", { data: "value" });

    const snapshot = metrics.snapshot(cache);

    // Verify the snapshot has all expected fields
    expect(snapshot).toHaveProperty("hits");
    expect(snapshot).toHaveProperty("misses");
    expect(snapshot).toHaveProperty("totalLookups");
    expect(snapshot).toHaveProperty("hitRatio");
    expect(snapshot).toHaveProperty("cacheSize");
    expect(snapshot).toHaveProperty("evictions");
    expect(snapshot).toHaveProperty("estimatedMemoryBytes");
    expect(snapshot).toHaveProperty("timestamp");

    // Verify types
    expect(typeof snapshot.hits).toBe("number");
    expect(typeof snapshot.misses).toBe("number");
    expect(typeof snapshot.totalLookups).toBe("number");
    expect(typeof snapshot.hitRatio).toBe("number");
    expect(typeof snapshot.cacheSize).toBe("number");
    expect(typeof snapshot.evictions).toBe("number");
    expect(typeof snapshot.estimatedMemoryBytes).toBe("number");
    expect(typeof snapshot.timestamp).toBe("string");
  });
});
