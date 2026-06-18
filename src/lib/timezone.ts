// Lightweight timezone helpers built on Intl, avoiding version-specific
// date-fns-tz APIs. All booking logic is anchored to the shop's
// timezone (America/New_York).

/**
 * Converts a "wall clock" date + time in a given IANA timezone into the
 * equivalent UTC Date instant. Handles DST automatically.
 */
export function zonedTimeToUtc(
  dateStr: string, // "YYYY-MM-DD"
  timeStr: string, // "HH:mm" or "HH:mm:ss"
  timeZone: string
): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute, second = 0] = timeStr.split(":").map(Number);

  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const offsetMinutes = getTimeZoneOffsetMinutes(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offsetMinutes * 60000);
}

/**
 * Returns the offset (in minutes) that must be subtracted from a UTC
 * instant to get the wall-clock time in `timeZone`, i.e.
 * localTime = utcTime + offset.
 */
export function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) map[part.type] = part.value;

  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour) === 24 ? 0 : Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );
  return (asUtc - date.getTime()) / 60000;
}

/** Returns the day of week (0 = Sunday ... 6 = Saturday) for a date string in the given timezone. */
export function getZonedDayOfWeek(dateStr: string, timeZone: string): number {
  // Anchor at noon to avoid any DST edge cases near midnight.
  const noonUtc = zonedTimeToUtc(dateStr, "12:00:00", timeZone);
  const dtf = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" });
  const weekday = dtf.format(noonUtc);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[weekday];
}

/** Formats a UTC Date as "HH:mm" in the given timezone (24h). */
export function formatTimeInTz(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** Formats a UTC Date as a "YYYY-MM-DD" date string in the given timezone. */
export function formatDateInTz(date: Date, timeZone: string): string {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) map[part.type] = part.value;
  return `${map.year}-${map.month}-${map.day}`;
}

/** Returns today's date as "YYYY-MM-DD" in the given timezone. */
export function todayInTz(timeZone: string): string {
  return formatDateInTz(new Date(), timeZone);
}
