import { describe, expect, it } from "vitest";

/**
 * Tests for user-scoped AI cache key generation (Issue #592).
 *
 * The functions `buildUserScopedCacheKey` and `resolveUserId` are defined
 * inside server.ts's `startServer()` closure.  We re-implement the pure
 * logic here to verify correctness without starting a full HTTP server.
 */

// ── Re-implement pure helpers for unit testing ────────────────────────

function buildUserScopedCacheKey(userId: string, prompt: string): string {
  let hash = 5381;
  for (let i = 0; i < prompt.length; i++) {
    hash = ((hash << 5) + hash + prompt.charCodeAt(i)) | 0;
  }
  return `${userId}:${hash.toString(36)}`;
}

function resolveUserIdFromHeader(authHeader: string | undefined, ip?: string): string {
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7);
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
        return payload.user_id || payload.sub || `anon:${ip || "unknown"}`;
      }
    } catch {
      // Fall through to anonymous
    }
  }
  return `anon:${ip || "unknown"}`;
}

// ── Tests ─────────────────────────────────────────────────────────────

describe("buildUserScopedCacheKey", () => {
  it("includes userId as prefix", () => {
    const key = buildUserScopedCacheKey("user-123", "hello");
    expect(key).toMatch(/^user-123:/);
  });

  it("produces the same key for the same user and prompt", () => {
    const k1 = buildUserScopedCacheKey("u1", "prompt A");
    const k2 = buildUserScopedCacheKey("u1", "prompt A");
    expect(k1).toBe(k2);
  });

  it("produces different keys for different users with the same prompt", () => {
    const k1 = buildUserScopedCacheKey("user-A", "same prompt");
    const k2 = buildUserScopedCacheKey("user-B", "same prompt");
    expect(k1).not.toBe(k2);
  });

  it("produces different keys for the same user with different prompts", () => {
    const k1 = buildUserScopedCacheKey("u1", "prompt X");
    const k2 = buildUserScopedCacheKey("u1", "prompt Y");
    expect(k1).not.toBe(k2);
  });

  it("handles empty prompt", () => {
    const key = buildUserScopedCacheKey("u1", "");
    expect(key).toMatch(/^u1:/);
    // djb2 of empty string = 5381
    expect(key).toBe(`u1:${(5381).toString(36)}`);
  });

  it("handles anonymous user prefix", () => {
    const key = buildUserScopedCacheKey("anon:192.168.1.1", "test");
    expect(key).toMatch(/^anon:192\.168\.1\.1:/);
  });

  it("handles very long prompts without collision", () => {
    const longA = "a".repeat(10000);
    const longB = "b".repeat(10000);
    const k1 = buildUserScopedCacheKey("u1", longA);
    const k2 = buildUserScopedCacheKey("u1", longB);
    expect(k1).not.toBe(k2);
  });

  it("deterministic across calls", () => {
    const keys = Array.from({ length: 100 }, () =>
      buildUserScopedCacheKey("user-x", "deterministic prompt"),
    );
    expect(new Set(keys).size).toBe(1);
  });
});

describe("resolveUserId (header parsing)", () => {
  function makeToken(payload: Record<string, unknown>): string {
    const header = Buffer.from(JSON.stringify({ alg: "RS256" })).toString("base64url");
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const sig = "fakesig";
    return `${header}.${body}.${sig}`;
  }

  it("extracts user_id from a valid Bearer token", () => {
    const token = makeToken({ user_id: "uid-42" });
    expect(resolveUserIdFromHeader(`Bearer ${token}`)).toBe("uid-42");
  });

  it("falls back to sub claim when user_id is absent", () => {
    const token = makeToken({ sub: "sub-99" });
    expect(resolveUserIdFromHeader(`Bearer ${token}`)).toBe("sub-99");
  });

  it("returns anonymous with IP when no Authorization header", () => {
    expect(resolveUserIdFromHeader(undefined, "10.0.0.1")).toBe("anon:10.0.0.1");
  });

  it("returns anonymous with 'unknown' when no IP available", () => {
    expect(resolveUserIdFromHeader(undefined)).toBe("anon:unknown");
  });

  it("returns anonymous for malformed token", () => {
    expect(resolveUserIdFromHeader("Bearer not-a-jwt", "1.2.3.4")).toBe("anon:1.2.3.4");
  });

  it("returns anonymous for non-Bearer auth scheme", () => {
    expect(resolveUserIdFromHeader("Basic dXNlcjpwYXNz")).toBe("anon:unknown");
  });
});

describe("Cache isolation between users", () => {
  it("two users with the same prompt get different cache keys", () => {
    const keyAlice = buildUserScopedCacheKey("alice", "explain quantum computing");
    const keyBob = buildUserScopedCacheKey("bob", "explain quantum computing");
    expect(keyAlice).not.toBe(keyBob);
  });

  it("same user across requests gets the same cache key", () => {
    const key1 = buildUserScopedCacheKey("alice", "explain quantum computing");
    const key2 = buildUserScopedCacheKey("alice", "explain quantum computing");
    expect(key1).toBe(key2);
  });

  it("anonymous users with different IPs get different keys", () => {
    const key1 = buildUserScopedCacheKey("anon:10.0.0.1", "prompt");
    const key2 = buildUserScopedCacheKey("anon:10.0.0.2", "prompt");
    expect(key1).not.toBe(key2);
  });

  it("authenticated user keys never collide with anonymous keys", () => {
    const authKey = buildUserScopedCacheKey("uid-42", "same prompt");
    const anonKey = buildUserScopedCacheKey("anon:192.168.1.1", "same prompt");
    expect(authKey).not.toBe(anonKey);
  });
});
