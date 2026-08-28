export type SchedulerTask = () => void | Promise<void>;

export interface NonOverlappingJobOptions {
  name: string;
  intervalMs: number;
  task: SchedulerTask;
  /**
   * Allows timer-based execution in tests when explicitly requested.
   * By default, start() is a no-op when NODE_ENV === "test".
   */
  allowInTest?: boolean;
}

export interface SchedulerJobStats {
  name: string;
  running: boolean;
  startedAt: number | null;
  completedAt: number | null;
  durationMs: number | null;
  skippedRuns: number;
}

export interface NonOverlappingJob {
  start(): void;
  stop(): void;
  runNow(): Promise<boolean>;
  getStats(): SchedulerJobStats;
  getIntervalHandle(): NodeJS.Timeout | null;
}

export function createNonOverlappingJob(
  options: NonOverlappingJobOptions,
): NonOverlappingJob {
  if (!options.name.trim()) {
    throw new Error("Scheduler job name is required.");
  }

  if (!Number.isFinite(options.intervalMs) || options.intervalMs <= 0) {
    throw new Error("Scheduler interval must be a positive number.");
  }

  let running = false;
  let startedAt: number | null = null;
  let completedAt: number | null = null;
  let durationMs: number | null = null;
  let skippedRuns = 0;
  let intervalHandle: NodeJS.Timeout | null = null;

  const runNow = async (): Promise<boolean> => {
    if (running) {
      skippedRuns += 1;
      console.warn(
        `[Scheduler:${options.name}] Skipping execution because the previous run is still active.`,
      );
      return false;
    }

    running = true;
    startedAt = Date.now();
    completedAt = null;
    durationMs = null;

    try {
      await options.task();
      return true;
    } finally {
      completedAt = Date.now();
      durationMs = completedAt - (startedAt ?? completedAt);
      running = false;
    }
  };

  const tick = (): void => {
    void runNow().catch((error) => {
      console.error(`[Scheduler:${options.name}] Scheduled task failed:`, error);
    });
  };

  const start = (): void => {
    if (intervalHandle) return;

    if (
      process.env.NODE_ENV === "test" &&
      options.allowInTest !== true
    ) {
      return;
    }

    intervalHandle = setInterval(tick, options.intervalMs);
  };

  const stop = (): void => {
    if (!intervalHandle) return;
    clearInterval(intervalHandle);
    intervalHandle = null;
  };

  return {
    start,
    stop,
    runNow,
    getStats: () => ({
      name: options.name,
      running,
      startedAt,
      completedAt,
      durationMs,
      skippedRuns,
    }),
    getIntervalHandle: () => intervalHandle,
  };
}

export function createDeadlineSchedulerJobs(
  runDeadlineChecks: SchedulerTask,
  runWeeklyDigest: SchedulerTask,
  options: {
    dailyIntervalMs: number;
    weeklyIntervalMs: number;
    allowInTest?: boolean;
  },
): {
  deadlineJob: NonOverlappingJob;
  weeklyDigestJob: NonOverlappingJob;
  start(): void;
  stop(): void;
} {
  const deadlineJob = createNonOverlappingJob({
    name: "deadline-reminders",
    intervalMs: options.dailyIntervalMs,
    task: runDeadlineChecks,
    allowInTest: options.allowInTest,
  });

  const weeklyDigestJob = createNonOverlappingJob({
    name: "weekly-digest",
    intervalMs: options.weeklyIntervalMs,
    task: runWeeklyDigest,
    allowInTest: options.allowInTest,
  });

  return {
    deadlineJob,
    weeklyDigestJob,
    start() {
      deadlineJob.start();
      weeklyDigestJob.start();
    },
    stop() {
      deadlineJob.stop();
      weeklyDigestJob.stop();
    },
  };
}
