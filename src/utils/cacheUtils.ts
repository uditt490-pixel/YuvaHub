/**
 * Generates a uniquely deterministic cache key by sorting parameters.
 * Fix for Issue #188: Prevents stale collisions and parameter-order duplicates.
 */
export function generateCacheKey(pathname: string, params: Record<string, any> = {}, method: string = "GET"): string {
  const sortedKeys = Object.keys(params).sort();
  const normalizedParams: Record<string, any> = {};
  for (const k of sortedKeys) {
    if (params[k] !== undefined && params[k] !== null && params[k] !== "") {
      normalizedParams[k] = params[k];
    }
  }
  return `${method}_${pathname}_${JSON.stringify(normalizedParams)}`;
}
