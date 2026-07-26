import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the connection and queue
vi.mock("../src/queues/connection.js", () => ({
  connection: {
    on: () => {},
    emit: () => {}
  },
  isRedisReady: () => true
}));

const mockJobs: any[] = [];
vi.mock("bullmq", () => {
  return {
    Queue: class {
      name: string;
      constructor(name: string) {
        this.name = name;
      }
      async add(name: string, data: any, opts: any = {}) {
        const existingIdx = mockJobs.findIndex(j => j.opts.jobId === opts.jobId);
        if (existingIdx >= 0) {
          mockJobs[existingIdx] = { name, data, opts };
        } else {
          mockJobs.push({ name, data, opts });
        }
        return { id: opts.jobId || "mock-job-id" };
      }
    },
    Worker: class {
      constructor() {}
      on() {}
    }
  };
});

const mockRedisStore: Record<string, string> = {};
vi.mock("../src/api/redis.js", () => {
  const multi = () => {
    const chain = {
      incr: (key: string) => {
        const val = parseInt(mockRedisStore[key] || "0", 10) + 1;
        mockRedisStore[key] = String(val);
        return chain;
      },
      expire: (key: string, ttl: number) => {
        return chain;
      },
      exec: async () => {
        return [];
      }
    };
    return chain;
  };
  return {
    redisClient: {
      get: async (key: string) => mockRedisStore[key] || null,
      set: async (key: string, val: string) => {
        mockRedisStore[key] = val;
        return "OK";
      },
      del: async (key: string) => {
        delete mockRedisStore[key];
        return 1;
      },
      multi
    }
  };
});

// Configure process.env before importing
process.env.JWT_SECRET = "test_secret";

import { scheduleDeadlineNotification, registerRepeatableDeadlineJobs } from "../src/queues/deadlineQueue.js";
import { createBreaker } from "../src/services/circuitBreaker.js";

describe("Deadline Scheduler & Circuit Breaker persistent checks", () => {
  beforeEach(() => {
    mockJobs.length = 0;
    for (const key in mockRedisStore) {
      delete mockRedisStore[key];
    }
    (globalThis as any).REDIS_AVAILABLE = true;
  });

  it("should schedule deadline notification delayed jobs with unique jobId", async () => {
    const oppId = "opp_123";
    const deadline = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now

    await scheduleDeadlineNotification(oppId, deadline);

    expect(mockJobs.length).toBe(1);
    expect(mockJobs[0].name).toBe("deadline-alert");
    expect(mockJobs[0].opts.jobId).toBe(`deadline-${oppId}`);
    expect(mockJobs[0].opts.delay).toBeGreaterThan(0);

    // Schedule same opportunity twice should replace the existing one
    const newDeadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    await scheduleDeadlineNotification(oppId, newDeadline);
    
    expect(mockJobs.length).toBe(1); // Still 1 job, replaced successfully
    expect(mockJobs[0].data.deadline).toBe(newDeadline.toISOString());
  });

  it("should register repeatable cron jobs", async () => {
    await registerRepeatableDeadlineJobs();
    const dailyJob = mockJobs.find(j => j.opts.jobId === "repeat-daily-deadline");
    const weeklyJob = mockJobs.find(j => j.opts.jobId === "repeat-weekly-digest");

    expect(dailyJob).toBeDefined();
    expect(dailyJob.opts.repeat.pattern).toBe("0 0 * * *");
    expect(weeklyJob).toBeDefined();
    expect(weeklyJob.opts.repeat.pattern).toBe("0 0 * * 0");
  });

  it("should persist failure counts and open circuit breaker when threshold is met", async () => {
    let callCount = 0;
    const failingAction = async () => {
      callCount++;
      throw new Error("Action failed");
    };

    const breaker = createBreaker(failingAction, { errorThresholdPercentage: 50 }, "test-service");

    // Execute first failure
    await expect(breaker.fire()).rejects.toThrow("Action failed");
    expect(mockRedisStore["circuit:test-service:failures"]).toBe("1");

    // Set failure count to 5 (threshold) directly in mock redis to simulate distributed state sync
    mockRedisStore["circuit:test-service:failures"] = "5";

    // Call fire again. The circuit should open automatically because the Redis failure count >= 5
    await expect(breaker.fire()).rejects.toThrow("Breaker is open");
    expect(breaker.opened).toBe(true);
  });
});
