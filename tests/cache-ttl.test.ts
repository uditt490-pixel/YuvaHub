import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock("ioredis", () => {
  class MockRedis {
    status = "ready";

    set = vi.fn().mockResolvedValue("OK");
    get = vi.fn().mockResolvedValue(null);
    del = vi.fn().mockResolvedValue(1);
    call = vi.fn();

    on = vi.fn(
      (
        event: string,
        callback: (...args: unknown[]) => void,
      ) => {
        if (event === "connect") {
          callback();
        }

        return this;
      },
    );
  }

  return {
    default: MockRedis,
  };
});

import {
  DEFAULT_CACHE_TTL,
  cacheGet,
  cacheSet,
  normalizeCacheTtl,
  redisClient,
} from "../src/api/redis";

describe("Redis cache TTL contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redisClient.status = "ready";
  });

  it("uses a five-minute default TTL", async () => {
    await cacheSet(
      "opportunities:test",
      { value: 1 },
    );

    expect(redisClient.set).toHaveBeenCalledWith(
      "opportunities:test",
      JSON.stringify({ value: 1 }),
      "EX",
      DEFAULT_CACHE_TTL,
    );
  });

  it("allows an explicit positive TTL", async () => {
    await cacheSet(
      "opportunity:1",
      { value: 1 },
      3600,
    );

    expect(redisClient.set).toHaveBeenCalledWith(
      "opportunity:1",
      JSON.stringify({ value: 1 }),
      "EX",
      3600,
    );
  });

  it("falls back for invalid TTL values", () => {
    expect(normalizeCacheTtl(0)).toBe(300);
    expect(normalizeCacheTtl(-20)).toBe(300);
    expect(normalizeCacheTtl(Number.NaN)).toBe(300);
    expect(normalizeCacheTtl(Number.POSITIVE_INFINITY)).toBe(300);
  });

  it("returns null when Redis is unavailable", async () => {
    redisClient.status = "end";

    await expect(
      cacheGet("missing"),
    ).resolves.toBeNull();
  });

  it("removes invalid cached JSON", async () => {
    redisClient.get = vi
      .fn()
      .mockResolvedValue("invalid-json");

    await expect(
      cacheGet("broken"),
    ).resolves.toBeNull();

    expect(redisClient.del).toHaveBeenCalledWith(
      "broken",
    );
  });
});
