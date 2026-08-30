/**
 * Returns the ISO week-year and week number for a UTC date.
 * ISO weeks start on Monday and week 1 contains the first Thursday.
 */
export function getIsoWeek(date: Date): { year: number; week: number } {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);

  const year = utc.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(
    (((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7,
  );

  return { year, week };
}

export function getWeeklyDigestKey(userId: string, date: Date): string {
  const { year, week } = getIsoWeek(date);
  return `weekly-digest:${userId}:${year}-${String(week).padStart(2, "0")}`;
}
