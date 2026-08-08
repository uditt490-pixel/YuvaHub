import { describe, it, expect, vi } from 'vitest';
import { executeScraperWithRetry, isRetryableError } from '../src/utils/retryScraper.js';

describe('Automatic Retry Failed Scraper Jobs (#586)', () => {
  it('should identify retryable transient errors correctly', () => {
    expect(isRetryableError(new Error('fetch failed'))).toBe(true);
    expect(isRetryableError(new Error('HTTP 503 Service Unavailable'))).toBe(true);
    expect(isRetryableError(new Error('Connection timeout'))).toBe(true);
    expect(isRetryableError(new Error('HTTP 404 Not Found'))).toBe(false);
  });

  it('should retry automatically on retryable failure and succeed', async () => {
    let attempts = 0;
    const mockAction = async (attempt: number) => {
      attempts++;
      if (attempts < 2) {
        throw new Error('fetch failed (network error)');
      }
      return 'success';
    };

    const result = await executeScraperWithRetry(mockAction, {
      delaysMs: [10, 20],
      maxAttempts: 3,
    });

    expect(result).toBe('success');
    expect(attempts).toBe(2);
  });

  it('should stop after retry limit on permanent failure', async () => {
    let attempts = 0;
    const mockAction = async () => {
      attempts++;
      throw new Error('500 Internal Server Error');
    };

    await expect(
      executeScraperWithRetry(mockAction, {
        delaysMs: [10, 10],
        maxAttempts: 3,
      })
    ).rejects.toThrow('500 Internal Server Error');

    expect(attempts).toBe(3);
  });

  it('should stop immediately on non-retryable error without retrying', async () => {
    let attempts = 0;
    const mockAction = async () => {
      attempts++;
      throw new Error('HTTP 404 Not Found');
    };

    await expect(
      executeScraperWithRetry(mockAction, {
        delaysMs: [10, 10],
        maxAttempts: 3,
      })
    ).rejects.toThrow('HTTP 404 Not Found');

    expect(attempts).toBe(1);
  });
});
