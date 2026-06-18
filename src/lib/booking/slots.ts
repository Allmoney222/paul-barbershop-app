import { zonedTimeToUtc, getZonedDayOfWeek } from "@/lib/timezone";
import type { Availability, BlockedTime } from "@/types/database";

export interface BusyInterval {
  start_time: string; // ISO
  end_time: string; // ISO
}

type Range = { start: Date; end: Date };

/**
 * Generates available appointment start times (in UTC) for a single
 * staff member on a given date, given their recurring availability,
 * one-off blocks, and existing busy intervals.
 */
export function generateSlotsForStaff(params: {
  date: string; // "YYYY-MM-DD" in shop timezone
  timezone: string;
  durationMinutes: number;
  bufferMinutes: number;
  slotIncrementMinutes: number;
  availability: Pick<Availability, "day_of_week" | "start_time" | "end_time">[];
  blockedTimes: Pick<BlockedTime, "date" | "start_time" | "end_time">[];
  busyIntervals: BusyInterval[];
  now: Date;
}): Date[] {
  const {
    date,
    timezone,
    durationMinutes,
    bufferMinutes,
    slotIncrementMinutes,
    availability,
    blockedTimes,
    busyIntervals,
    now,
  } = params;

  const dayOfWeek = getZonedDayOfWeek(date, timezone);

  const todaysBlocks = blockedTimes.filter((b) => b.date === date);

  // Whole-day block
  if (todaysBlocks.some((b) => !b.start_time && !b.end_time)) {
    return [];
  }

  const windows = availability.filter((a) => a.day_of_week === dayOfWeek);
  if (windows.length === 0) return [];

  let freeRanges: Range[] = windows.map((w) => ({
    start: zonedTimeToUtc(date, w.start_time, timezone),
    end: zonedTimeToUtc(date, w.end_time, timezone),
  }));

  // Subtract partial blocked windows
  for (const block of todaysBlocks) {
    if (!block.start_time || !block.end_time) continue;
    const blockRange: Range = {
      start: zonedTimeToUtc(date, block.start_time, timezone),
      end: zonedTimeToUtc(date, block.end_time, timezone),
    };
    freeRanges = subtractRange(freeRanges, blockRange);
  }

  // Subtract busy intervals, expanded by buffer on each side
  const bufferMs = bufferMinutes * 60000;
  for (const busy of busyIntervals) {
    const busyRange: Range = {
      start: new Date(new Date(busy.start_time).getTime() - bufferMs),
      end: new Date(new Date(busy.end_time).getTime() + bufferMs),
    };
    freeRanges = subtractRange(freeRanges, busyRange);
  }

  const durationMs = durationMinutes * 60000;
  const incrementMs = slotIncrementMinutes * 60000;
  const slots: Date[] = [];

  for (const range of freeRanges) {
    let cursor = roundUpToIncrement(range.start, slotIncrementMinutes);
    while (cursor.getTime() + durationMs <= range.end.getTime()) {
      if (cursor.getTime() >= now.getTime()) {
        slots.push(new Date(cursor));
      }
      cursor = new Date(cursor.getTime() + incrementMs);
    }
  }

  return slots;
}

/** Subtracts `remove` from each range in `ranges`, splitting as needed. */
function subtractRange(ranges: Range[], remove: Range): Range[] {
  const result: Range[] = [];
  for (const r of ranges) {
    if (remove.end <= r.start || remove.start >= r.end) {
      // No overlap
      result.push(r);
      continue;
    }
    if (remove.start > r.start) {
      result.push({ start: r.start, end: new Date(Math.min(remove.start.getTime(), r.end.getTime())) });
    }
    if (remove.end < r.end) {
      result.push({ start: new Date(Math.max(remove.end.getTime(), r.start.getTime())), end: r.end });
    }
  }
  // Drop any zero/negative-length ranges produced by edge overlaps
  return result.filter((r) => r.end.getTime() > r.start.getTime());
}

function roundUpToIncrement(date: Date, incrementMinutes: number): Date {
  const ms = incrementMinutes * 60000;
  const rounded = Math.ceil(date.getTime() / ms) * ms;
  return new Date(rounded);
}
