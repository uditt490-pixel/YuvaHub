import { describe, it, expect, beforeEach } from "vitest";
import { LRUCache } from "../src/utils/lruCache";
import { getCachedResponse, setCachedResponse, clearAICache } from "../src/api/genai";

describe("LRU Cache for AI Responses (Issue #593)", () => {
  beforeEach(() => {
    clearAICache();
  });

  it("should store and retrieve cached AI responses", () => {
    const key = "prompt:summarize_resume";
    const data = "Summary of candidate experience";

    setCachedResponse(key, data);
    expect(getCachedResponse(key)).toBe(data);
  });

  it("should evict least recently used entries when cache capacity is exceeded", () => {
    const cache = new LRUCache<string, string>({ maxSize: 3, defaultTtlMs: 60000 });

    cache.set("key1", "val1");
    cache.set("key2", "val2");
    cache.set("key3", "val3");

    // Access key1 to make key2 the least recently used
    expect(cache.get("key1")).toBe("val1");

    // Add key4, which should evict key2 (the LRU entry)
    cache.set("key4", "val4");

    expect(cache.get("key1")).toBe("val1");
    expect(cache.get("key2")).toBe(null); // Evicted!
    expect(cache.get("key3")).toBe("val3");
    expect(cache.get("key4")).toBe("val4");

    const stats = cache.getStats();
    expect(stats.evictions).toBe(1);
    expect(stats.size).toBe(3);
  });

  it("should expire items after TTL", async () => {
    const cache = new LRUCache<string, string>({ maxSize: 10, defaultTtlMs: 50 }); // 50ms TTL

    cache.set("short_lived", "data", 50);
    expect(cache.get("short_lived")).toBe("data");

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 70));

    expect(cache.get("short_lived")).toBe(null);
  });

  it("should support dynamic max size re-configuration", () => {
    const cache = new LRUCache<string, string>({ maxSize: 5, defaultTtlMs: 60000 });

    for (let i = 1; i <= 5; i++) {
      cache.set(`k${i}`, `v${i}`);
    }
    expect(cache.size).toBe(5);

    // Reduce capacity to 2 -> should evict 3 entries
    cache.setMaxSize(2);
    expect(cache.size).toBe(2);
    expect(cache.getStats().evictions).toBe(3);
  });

  it("should track cache stats (hits, misses, evictions)", () => {
    const cache = new LRUCache<string, string>({ maxSize: 2 });

    cache.get("missing"); // Miss 1
    cache.set("a", "alpha");
    cache.get("a"); // Hit 1
    cache.set("b", "beta");
    cache.set("c", "gamma"); // Evicts "a"

    const stats = cache.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.evictions).toBe(1);
    expect(stats.size).toBe(2);
  });
});
