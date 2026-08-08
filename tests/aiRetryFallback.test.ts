import { describe, it, expect, vi, beforeEach } from "vitest";
import { generatedContentProxyWithRetry } from "../src/services/gemini";

describe("AI Retry & Fallback Mechanism (Issue #595)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should succeed immediately when AI request is successful", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ text: "AI Response content" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await generatedContentProxyWithRetry("Test prompt", false, { maxRetries: 2 });
    expect(result.success).toBe(true);
    expect(result.text).toBe("AI Response content");
    expect(result.attemptsUsed).toBe(1);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should retry transient 503 errors up to maxRetries before failing", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
    });
    vi.stubGlobal("fetch", mockFetch);

    const retryCallback = vi.fn();
    const result = await generatedContentProxyWithRetry("Test prompt", false, {
      maxRetries: 2,
      onRetry: retryCallback,
    });

    expect(result.success).toBe(false);
    expect(result.isRetryable).toBe(true);
    expect(result.attemptsUsed).toBe(3); // 1 initial + 2 retries
    expect(retryCallback).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("should succeed on retry after temporary failure", async () => {
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return { ok: false, status: 503, statusText: "High Load" };
      }
      return { ok: true, json: async () => ({ text: "Recovered AI response" }) };
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await generatedContentProxyWithRetry("Test prompt", false, { maxRetries: 2 });
    expect(result.success).toBe(true);
    expect(result.text).toBe("Recovered AI response");
    expect(result.attemptsUsed).toBe(2);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should detect network timeout errors as retryable", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network request timed out"));
    vi.stubGlobal("fetch", mockFetch);

    const result = await generatedContentProxyWithRetry("Test prompt", false, { maxRetries: 1 });
    expect(result.success).toBe(false);
    expect(result.isRetryable).toBe(true);
    expect(result.error).toContain("timed out");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
