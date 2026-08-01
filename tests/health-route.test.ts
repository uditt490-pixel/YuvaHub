import express from "express";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/api/services/healthService", () => ({
  getHealthSnapshot: vi.fn(),
}));

import { getHealthSnapshot } from "../src/api/services/healthService";
import { healthCheck } from "../src/api/controllers/healthController";

const mockedGetHealthSnapshot = vi.mocked(getHealthSnapshot);
const servers: Array<ReturnType<express.Express["listen"]>> = [];

afterEach(async () => {
  mockedGetHealthSnapshot.mockReset();

  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) =>
            error ? reject(error) : resolve(),
          );
        }),
    ),
  );
});

async function startServer() {
  const app = express();
  app.get("/api/v1/health", healthCheck);

  // Mirrors the production frontend fallback. Health must resolve first.
  // Express 5 / path-to-regexp v8 requires a named wildcard — bare "*"
  // throws "Missing parameter name at index 1". Use "*splat" instead.
  app.get("*splat", (_req, res) => {
    res.status(404).send("SPA fallback");
  });

  const server = app.listen(0, "127.0.0.1");
  servers.push(server);

  await new Promise<void>((resolve) =>
    server.once("listening", resolve),
  );

  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}`;
}

describe("GET /api/v1/health", () => {
  it("returns 200 JSON for a healthy service", async () => {
    mockedGetHealthSnapshot.mockResolvedValue({
      status: "ok",
      service: "YuvaHub API",
      timestamp: "2026-07-23T12:00:00.000Z",
      database: "connected",
      uptimeSeconds: 42,
    });

    const baseUrl = await startServer();
    const response = await fetch(`${baseUrl}/api/v1/health`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain(
      "application/json",
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body).toEqual({
      status: "ok",
      service: "YuvaHub API",
      timestamp: "2026-07-23T12:00:00.000Z",
      database: "connected",
      uptimeSeconds: 42,
    });
  });

  it("returns 503 JSON for a degraded service", async () => {
    mockedGetHealthSnapshot.mockResolvedValue({
      status: "degraded",
      service: "YuvaHub API",
      timestamp: "2026-07-23T12:00:00.000Z",
      database: "disconnected",
      uptimeSeconds: 42,
    });

    const baseUrl = await startServer();
    const response = await fetch(`${baseUrl}/api/v1/health`);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(response.headers.get("content-type")).toContain(
      "application/json",
    );
    expect(body.status).toBe("degraded");
    expect(body.database).toBe("disconnected");
    expect(body).not.toHaveProperty("error");
    expect(body).not.toHaveProperty("stack");
  });

  it("resolves before the SPA fallback", async () => {
    mockedGetHealthSnapshot.mockResolvedValue({
      status: "ok",
      service: "YuvaHub API",
      timestamp: "2026-07-23T12:00:00.000Z",
      database: "connected",
      uptimeSeconds: 42,
    });

    const baseUrl = await startServer();
    const response = await fetch(`${baseUrl}/api/v1/health`);

    expect(response.status).not.toBe(404);
    expect(await response.json()).not.toEqual("SPA fallback");
  });
});