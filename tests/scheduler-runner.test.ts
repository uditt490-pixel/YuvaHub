import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createDeadlineSchedulerJobs,
  createNonOverlappingJob,
} from "../src/services/schedulerRunner";

describe("createNonOverlappingJob", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("does not run the same task concurrently", async () => {
    let resolveTask!: () => void;
    let calls = 0;

    const task = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          calls += 1;
          resolveTask = resolve;
        }),
    );

    const job = createNonOverlappingJob({
      name: "deadline-reminders",
      intervalMs: 10,
      task,
      allowInTest: true,
    });

    const firstRun = job.runNow();
    expect(calls).toBe(1);

    const secondRun = await job.runNow();
    expect(secondRun).toBe(false);
    expect(job.getStats().skippedRuns).toBe(1);
    expect(calls).toBe(1);

    resolveTask();
    await firstRun;

    expect(job.getStats().running).toBe(false);
    expect(job.getStats().completedAt).not.toBeNull();
    expect(job.getStats().durationMs).not.toBeNull();
  });

  it("resets running state after a task fails", async () => {
    const job = createNonOverlappingJob({
      name: "weekly-digest",
      intervalMs: 1000,
      task: async () => {
        throw new Error("boom");
      },
    });

    await expect(job.runNow()).rejects.toThrow("boom");
    expect(job.getStats().running).toBe(false);
    expect(job.getStats().completedAt).not.toBeNull();
    expect(job.getStats().durationMs).not.toBeNull();
  });

  it("records skipped timer executions while a task is active", async () => {
    vi.useFakeTimers();

    let resolveTask!: () => void;
    const task = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveTask = resolve;
        }),
    );

    const job = createNonOverlappingJob({
      name: "deadline-reminders",
      intervalMs: 100,
      task,
      allowInTest: true,
    });

    job.start();
    expect(job.getIntervalHandle()).not.toBeNull();

    await vi.advanceTimersByTimeAsync(100);
    expect(task).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(300);
    expect(task).toHaveBeenCalledTimes(1);
    expect(job.getStats().skippedRuns).toBe(3);

    resolveTask();
    await vi.advanceTimersByTimeAsync(0);

    job.stop();
    expect(job.getIntervalHandle()).toBeNull();
  });

  it("can be stopped explicitly", () => {
    vi.useFakeTimers();

    const job = createNonOverlappingJob({
      name: "deadline-reminders",
      intervalMs: 100,
      task: vi.fn(),
      allowInTest: true,
    });

    job.start();
    expect(job.getIntervalHandle()).not.toBeNull();

    job.stop();
    expect(job.getIntervalHandle()).toBeNull();

    vi.advanceTimersByTime(500);
    expect(job.getStats().skippedRuns).toBe(0);
  });

  it("does not start background timers in test mode by default", () => {
    vi.useFakeTimers();

    const job = createNonOverlappingJob({
      name: "deadline-reminders",
      intervalMs: 100,
      task: vi.fn(),
    });

    job.start();

    expect(job.getIntervalHandle()).toBeNull();
  });
});

describe("createDeadlineSchedulerJobs", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps daily and weekly schedules independently configurable", () => {
    const deadlineTask = vi.fn();
    const weeklyTask = vi.fn();

    const scheduler = createDeadlineSchedulerJobs(
      deadlineTask,
      weeklyTask,
      {
        dailyIntervalMs: 1000,
        weeklyIntervalMs: 5000,
        allowInTest: true,
      },
    );

    expect(scheduler.deadlineJob.getStats().name).toBe("deadline-reminders");
    expect(scheduler.weeklyDigestJob.getStats().name).toBe("weekly-digest");

    scheduler.start();
    expect(scheduler.deadlineJob.getIntervalHandle()).not.toBeNull();
    expect(scheduler.weeklyDigestJob.getIntervalHandle()).not.toBeNull();

    scheduler.stop();
    expect(scheduler.deadlineJob.getIntervalHandle()).toBeNull();
    expect(scheduler.weeklyDigestJob.getIntervalHandle()).toBeNull();
  });
});
