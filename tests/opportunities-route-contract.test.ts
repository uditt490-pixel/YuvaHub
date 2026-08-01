import express from "express";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import apiRoutes from "../src/api/routes/index";

const servers: Array<ReturnType<express.Express["listen"]>> = [];

afterEach(async () => {
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

async function startTestServer() {
  const app = express();
  app.use(express.json());
  app.use("/api", apiRoutes);

  // This mirrors the production SPA fallback. API routes must resolve first.
  // Express 5 / path-to-regexp v8 requires a named wildcard — bare "*"
  // throws "Missing parameter name at index 1". Use "*splat" instead.
  app.get("*splat", (_req, res) => {
    res.status(404).json({
      error: "SPA fallback reached",
    });
  });

  const server = app.listen(0, "127.0.0.1");
  servers.push(server);

  await new Promise<void>((resolve) =>
    server.once("listening", resolve),
  );

  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}`;
}

describe("opportunities API compatibility routes", () => {
  it.each([
    "/api/v1/opportunities",
    "/api/opportunities",
  ])("resolves %s before the SPA fallback", async (path) => {
    const baseUrl = await startTestServer();
    const response = await fetch(`${baseUrl}${path}`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).not.toEqual({
      error: "SPA fallback reached",
    });

    expect(body).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.any(Array),
        items: expect.any(Array),
        pagination: expect.objectContaining({
          page: 1,
          limit: 20,
          totalItems: expect.any(Number),
          totalPages: expect.any(Number),
        }),
      }),
    );
  });

  it("returns a controlled 400 response for invalid pagination", async () => {
    const baseUrl = await startTestServer();
    const response = await fetch(
      `${baseUrl}/api/v1/opportunities?page=abc&limit=500`,
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual(
      expect.objectContaining({
        success: false,
        error: expect.any(String),
      }),
    );
  });

  it("preserves cursor compatibility", async () => {
    const baseUrl = await startTestServer();
    const response = await fetch(
      `${baseUrl}/api/v1/opportunities?cursor=2&limit=5`,
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.pagination.page).toBe(2);
    expect(body.pagination.limit).toBe(5);
  });
});