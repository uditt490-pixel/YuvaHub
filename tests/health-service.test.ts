import { describe, expect, it, vi } from "vitest";
import {
  checkDatabaseHealth,
  checkRedisHealth,
  checkRabbitMQHealth,
  checkAIProviderHealth,
  checkFirebaseHealth,
  getHealthSnapshot,
  runStartupHealthChecks,
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

describe("checkRedisHealth", () => {
  it("returns disabled when no client is provided", async () => {
    await expect(checkRedisHealth(null)).resolves.toBe("disabled");
    await expect(checkRedisHealth(undefined)).resolves.toBe("disabled");
  });

  it("returns connected when client is ready and ping succeeds", async () => {
    const client = { status: "ready", ping: vi.fn().mockResolvedValue("PONG") };
    await expect(checkRedisHealth(client)).resolves.toBe("connected");
    expect(client.ping).toHaveBeenCalled();
  });

  it("returns disconnected when client is not ready", async () => {
    const client = { status: "connecting", ping: vi.fn() };
    await expect(checkRedisHealth(client)).resolves.toBe("disconnected");
  });

  it("returns disconnected when ping throws", async () => {
    const client = {
      status: "ready",
      ping: vi.fn().mockRejectedValue(new Error("ECONNREFUSED")),
    };
    await expect(checkRedisHealth(client)).resolves.toBe("disconnected");
  });
});

describe("checkRabbitMQHealth", () => {
  it("returns disabled when no connection is provided", async () => {
    await expect(checkRabbitMQHealth(null)).resolves.toBe("disabled");
    await expect(checkRabbitMQHealth(undefined)).resolves.toBe("disabled");
  });

  it("returns connected when a channel can be created and closed", async () => {
    const fakeChannel = { close: vi.fn().mockResolvedValue(undefined) };
    const connection = {
      createChannel: vi.fn().mockResolvedValue(fakeChannel),
    };
    await expect(checkRabbitMQHealth(connection)).resolves.toBe("connected");
    expect(connection.createChannel).toHaveBeenCalled();
    expect(fakeChannel.close).toHaveBeenCalled();
  });

  it("returns disconnected when createChannel throws", async () => {
    const connection = {
      createChannel: vi.fn().mockRejectedValue(new Error("ECONNREFUSED")),
    };
    await expect(checkRabbitMQHealth(connection)).resolves.toBe("disconnected");
  });
});

describe("checkAIProviderHealth", () => {
  it("returns disconnected when API key is missing", () => {
    expect(checkAIProviderHealth(undefined)).toBe("disconnected");
    expect(checkAIProviderHealth("")).toBe("disconnected");
    expect(checkAIProviderHealth("   ")).toBe("disconnected");
  });

  it("returns connected when API key is present", () => {
    expect(checkAIProviderHealth("test-api-key-12345")).toBe("connected");
  });
});

describe("checkFirebaseHealth", () => {
  it("returns disabled when not configured", () => {
    expect(checkFirebaseHealth(undefined)).toBe("disabled");
  });

  it("returns connected when initialized", () => {
    expect(checkFirebaseHealth(true)).toBe("connected");
  });

  it("returns disconnected when not initialized", () => {
    expect(checkFirebaseHealth(false)).toBe("disconnected");
  });
});

describe("runStartupHealthChecks", () => {
  it("runs all checks and returns a complete report", async () => {
    const command = vi.fn().mockResolvedValue({ ok: 1 });
    const query = vi.fn().mockResolvedValue({ ok: 1 });
    const redisClient = { status: "ready", ping: vi.fn().mockResolvedValue("PONG") };
    const rabbitConnection = {
      createChannel: vi.fn().mockResolvedValue({ close: vi.fn() }),
    };

    const report = await runStartupHealthChecks({
      getCommandDatabase: () => ({ command }),
      getQueryDatabase: () => ({ command: query }),
      redisClient,
      rabbitmqConnection: rabbitConnection,
      geminiApiKey: "test-key",
      firebaseInitialized: true,
      now: () => new Date("2026-07-23T12:00:00.000Z"),
    });

    expect(report).toEqual({
      database: "connected",
      redis: "connected",
      rabbitmq: "connected",
      aiProvider: "connected",
      firebase: "connected",
      timestamp: "2026-07-23T12:00:00.000Z",
    });
  });

  it("reports degraded when optional services are unavailable", async () => {
    const report = await runStartupHealthChecks({
      getCommandDatabase: () => ({ isMock: true }),
      getQueryDatabase: () => ({ isMock: true }),
      redisClient: null,
      rabbitmqConnection: null,
      geminiApiKey: undefined,
      firebaseInitialized: undefined,
      now: () => new Date("2026-07-23T12:00:00.000Z"),
    });

    expect(report).toEqual({
      database: "disconnected",
      redis: "disabled",
      rabbitmq: "disabled",
      aiProvider: "disconnected",
      firebase: "disabled",
      timestamp: "2026-07-23T12:00:00.000Z",
    });
  });

  it("reports degraded when Redis ping fails", async () => {
    const report = await runStartupHealthChecks({
      getCommandDatabase: () => ({
        command: vi.fn().mockResolvedValue({ ok: 1 }),
      }),
      getQueryDatabase: () => ({
        command: vi.fn().mockResolvedValue({ ok: 1 }),
      }),
      redisClient: {
        status: "ready",
        ping: vi.fn().mockRejectedValue(new Error("ECONNREFUSED")),
      },
      rabbitmqConnection: null,
      geminiApiKey: "test-key",
      firebaseInitialized: true,
      now: () => new Date("2026-07-23T12:00:00.000Z"),
    });

    expect(report.database).toBe("connected");
    expect(report.redis).toBe("disconnected");
    expect(report.rabbitmq).toBe("disabled");
    expect(report.aiProvider).toBe("connected");
    expect(report.firebase).toBe("connected");
  });
});
