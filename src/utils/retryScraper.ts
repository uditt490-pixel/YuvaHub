export interface RetryConfig {
  maxAttempts?: number;
  initialDelayMs?: number;
  delaysMs?: number[];
  retryableErrors?: (err: any) => boolean;
}

export const DEFAULT_RETRY_DELAYS_MS = [5000, 15000, 30000]; // 5s, 15s, 30s

export function isRetryableError(error: any): boolean {
  if (!error) return false;
  const msg = (error.message || String(error)).toLowerCase();
  
  // Rate limit, network/connection timeout, transient server errors 500, 502, 503, 504
  return (
    msg.includes('fetch failed') ||
    msg.includes('network') ||
    msg.includes('timeout') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('500') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('504') ||
    msg.includes('rate limit')
  );
}

/**
 * Executes a scraper action with automatic exponential backoff retries.
 */
export async function executeScraperWithRetry<T>(
  action: (attempt: number) => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const delays = config.delaysMs || DEFAULT_RETRY_DELAYS_MS;
  const maxAttempts = config.maxAttempts || delays.length + 1;
  const checkRetryable = config.retryableErrors || isRetryableError;

  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`[ScraperRetry] Starting retry attempt ${attempt}/${maxAttempts}...`);
      }
      return await action(attempt);
    } catch (err: any) {
      lastError = err;
      const isRetryable = checkRetryable(err);

      console.warn(`[ScraperRetry] Attempt ${attempt}/${maxAttempts} failed: ${err.message || err}`);

      if (attempt >= maxAttempts) {
        console.error(`[ScraperRetry] Max retry limit (${maxAttempts}) reached. Permanent failure.`);
        break;
      }

      if (!isRetryable) {
        console.warn(`[ScraperRetry] Non-retryable error encountered. Stopping retries immediately.`);
        break;
      }

      const delay = delays[attempt - 1] || delays[delays.length - 1];
      console.log(`[ScraperRetry] Waiting ${delay / 1000}s exponential backoff before attempt ${attempt + 1}...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
