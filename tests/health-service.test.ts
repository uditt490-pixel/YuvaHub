import { describe, expect, it, vi } from "vitest";
import {
  checkDatabaseHealth,
  getHealthSnapshot,
} from "../src/api/services/healthService";

describe("health service", () => {
  it("reports connected when both database pools respond", async () => {
    const command = vi.fn().mockResolvedValue({ ok: 1 });
    const query = vi.fn().mockResolvedValue({ ok: 1 });

    await expect(
      checkDatabaseHealth(
        { command },
        { command: query },
      ),
    ).resolves.toBe("connected");

    expect(command).toHaveBeenCalledWith({ ping: 1 });
    expect(query).toHaveBeenCalledWith({ ping: 1 });
  });

  it("reports disconnected for MockDB", async () => {
    await expect(
      checkDatabaseHealth(
        { isMock: true },
        { isMock: true },
      ),
    ).resolves.toBe("disconnected");
  });

  it("reports disconnected when a ping fails", async () => {
    await expect(
      checkDatabaseHealth(
        {
          command: vi
            .fn()
            .mockRejectedValue(new Error("connection failed")),
        },
        { command: vi.fn().mockResolvedValue({ ok: 1 }) },
      ),
    ).resolves.toBe("disconnected");
  });

  it("builds a safe healthy response", async () => {
    const snapshot = await getHealthSnapshot({
      getCommandDatabase: () => ({
        command: vi.fn().mockResolvedValue({ ok: 1 }),
      }),
      getQueryDatabase: () => ({
        command: vi.fn().mockResolvedValue({ ok: 1 }),
      }),
      now: () => new Date("2026-07-23T12:00:00.000Z"),
      uptime: () => 42.9,
    });

    expect(snapshot).toEqual({
      status: "ok",
      service: "YuvaHub API",
      timestamp: "2026-07-23T12:00:00.000Z",
      database: "connected",
      uptimeSeconds: 42,
    });

    expect(JSON.stringify(snapshot)).not.toMatch(
      /mongodb|uri|password|credential|secret|stack/i,
    );
  });

  it("builds a controlled degraded response", async () => {
    const snapshot = await getHealthSnapshot({
      getCommandDatabase: () => ({ isMock: true }),
      getQueryDatabase: () => ({ isMock: true }),
      now: () => new Date("2026-07-23T12:00:00.000Z"),
      uptime: () => 10,
    });

    expect(snapshot).toEqual({
      status: "degraded",
      service: "YuvaHub API",
      timestamp: "2026-07-23T12:00:00.000Z",
      database: "disconnected",
      uptimeSeconds: 10,
    });
  });
});
