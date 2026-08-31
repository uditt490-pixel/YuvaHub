import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../src/api/db.js", () => ({
  dbCommand: null,
  dbQuery: null,
}));

vi.mock("../src/api/socketInstance.js", () => ({
  getSocketIO: () => null,
  setSocketIO: () => {},
}));

vi.mock("../src/api/redis.js", () => ({
  redisClient: null,
  createFailOpenStore: () => ({
    increment: async () => ({ hits: 0, resetTime: new Date(Date.now() + 15 * 60 * 1000) }),
    decrement: async () => {},
    resetKey: async () => {},
  }),
  DEFAULT_CACHE_TTL: 300,
  normalizeCacheTtl: (ttl: unknown, fallback: number = 300) =>
    Number.isSafeInteger(ttl) && (ttl as number) > 0 ? ttl : fallback,
  cacheSet: async () => false,
  cacheGet: async () => null,
  getOrSet: async (_key: string, factory: () => Promise<unknown>) => factory(),
}));

import userRoutes from "../src/api/routes/userRoutes";
import alumniRoutes from "../src/api/routes/alumniRoutes";
import { authMiddleware } from "../src/api/middlewares/auth.js";

function listRoutes(router: any): { method: string; path: string }[] {
  const out: { method: string; path: string }[] = [];
  for (const layer of router.stack || []) {
    if (layer.route) {
      const method = Object.keys(layer.route.methods).join(",").toUpperCase();
      out.push({ method, path: (layer.route.path as string) || "" });
    }
  }
  return out;
}

function routeHandlers(router: any, method: string, path: string): any[] {
  const layer = (router as any).stack.find(
    (l: any) => l.route && l.route.path === path && l.route.methods[method.toLowerCase()],
  );
  return layer ? layer.route.stack.map((h: any) => h.handle) : [];
}

describe("alumni network routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers alumni profile and mentoring endpoints", () => {
    const paths = listRoutes(userRoutes).map((r) => `${r.method} ${r.path}`);
    expect(paths).toContain("PATCH /users/:userId/profile");
    expect(paths).toContain("PATCH /users/:userId/mentoring-preference");
  });

  it("registers the alumni directory and request management endpoints", () => {
    const paths = listRoutes(alumniRoutes).map((r) => `${r.method} ${r.path}`);
    expect(paths).toContain("GET /alumni/directory");
    expect(paths).toContain("GET /alumni/:userId");
    expect(paths).toContain("POST /alumni/:userId/request-mentorship");
    expect(paths).toContain("GET /alumni/requests/received");
    expect(paths).toContain("GET /alumni/requests/sent");
    expect(paths).toContain("PATCH /alumni/requests/:requestId/accept");
    expect(paths).toContain("PATCH /alumni/requests/:requestId/decline");
  });

  it("protects alumni request actions with auth middleware", () => {
    expect(routeHandlers(alumniRoutes, "post", "/alumni/:userId/request-mentorship")).toContain(authMiddleware);
    expect(routeHandlers(alumniRoutes, "get", "/alumni/requests/received")).toContain(authMiddleware);
    expect(routeHandlers(alumniRoutes, "patch", "/alumni/requests/:requestId/accept")).toContain(authMiddleware);
  });
});
