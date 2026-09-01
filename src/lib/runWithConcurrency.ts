export interface ConcurrencySummary {
  succeeded: number;
  failed: number;
  failures: Array<{ index: number; error: unknown }>;
}

export function getConcurrencyLimit(
  value: string | number | undefined,
  fallback = 5,
): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
    return fallback;
  }
  return parsed;
}

export async function runWithConcurrency<T>(
  items: readonly T[],
  worker: (item: T, index: number) => Promise<void>,
  concurrency = 5,
): Promise<ConcurrencySummary> {
  const limit = getConcurrencyLimit(concurrency, 5);
  let cursor = 0;
  let succeeded = 0;
  let failed = 0;
  const failures: Array<{ index: number; error: unknown }> = [];

  async function consume(): Promise<void> {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;

      try {
        await worker(items[index], index);
        succeeded += 1;
      } catch (error) {
        failed += 1;
        failures.push({ index, error });
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => consume(),
  );

  await Promise.all(workers);
  return { succeeded, failed, failures };
}
