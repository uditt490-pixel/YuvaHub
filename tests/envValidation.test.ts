import { describe, it, expect, vi } from "vitest";
import { validateEnv, validateStartupEnv } from "../src/config/envValidation";

describe("Environment Variable Startup Validation (Issue #588)", () => {
  it("should pass validation when all required variables are present", () => {
    const mockEnv = {
      MONGODB_URI: "mongodb://localhost:27017/yuvahub_test",
      JWT_SECRET: "super-secret-jwt-key",
      GEMINI_API_KEY: "mock-gemini-key-12345",
    };

    const result = validateEnv(mockEnv);
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it("should fail validation when MONGODB_URI is missing", () => {
    const mockEnv = {
      JWT_SECRET: "super-secret-jwt-key",
      GEMINI_API_KEY: "mock-gemini-key-12345",
    };

    const result = validateEnv(mockEnv);
    expect(result.valid).toBe(false);
    expect(result.missing.some((m) => m.includes("MONGODB_URI"))).toBe(true);
  });

  it("should fail validation when JWT_SECRET is missing", () => {
    const mockEnv = {
      MONGODB_URI: "mongodb://localhost:27017/yuvahub_test",
      GEMINI_API_KEY: "mock-gemini-key-12345",
    };

    const result = validateEnv(mockEnv);
    expect(result.valid).toBe(false);
    expect(result.missing.some((m) => m.includes("JWT_SECRET"))).toBe(true);
  });

  it("should fail validation when GEMINI_API_KEY is missing", () => {
    const mockEnv = {
      MONGODB_URI: "mongodb://localhost:27017/yuvahub_test",
      JWT_SECRET: "super-secret-jwt-key",
    };

    const result = validateEnv(mockEnv);
    expect(result.valid).toBe(false);
    expect(result.missing.some((m) => m.includes("GEMINI_API_KEY"))).toBe(true);
  });

  it("should require REDIS_URL when Redis is explicitly enabled", () => {
    const mockEnvWithoutRedisUrl = {
      MONGODB_URI: "mongodb://localhost:27017/yuvahub_test",
      JWT_SECRET: "super-secret-jwt-key",
      GEMINI_API_KEY: "mock-gemini-key-12345",
      ENABLE_REDIS: "true",
    };

    const result1 = validateEnv(mockEnvWithoutRedisUrl);
    expect(result1.valid).toBe(false);
    expect(result1.missing.some((m) => m.includes("REDIS_URL"))).toBe(true);

    const mockEnvWithRedisUrl = {
      ...mockEnvWithoutRedisUrl,
      REDIS_URL: "redis://127.0.0.1:6379",
    };

    const result2 = validateEnv(mockEnvWithRedisUrl);
    expect(result2.valid).toBe(true);
  });

  it("should log errors clearly on startup validation failure without terminating in test mode", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const mockEnv = {
      NODE_ENV: "test",
    };

    const result = validateStartupEnv(mockEnv, false);
    expect(result.valid).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
