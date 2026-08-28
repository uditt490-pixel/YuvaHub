export function getCacheTtlSeconds(
  value: string | number | undefined,
  fallback = 900,
): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 86400) {
    return fallback;
  }
  return Math.floor(parsed);
}
