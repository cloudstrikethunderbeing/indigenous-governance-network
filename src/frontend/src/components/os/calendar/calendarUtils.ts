import type { SampleEvent } from "@/data/sampleNation";

/** A single day cell in the month grid. */
export interface CalendarDay {
  /** Stable key for the cell, e.g. "2026-04-11". */
  key: string;
  /** The date this cell represents. */
  date: Date;
  /** Whether the date belongs to the displayed month. */
  inMonth: boolean;
  /** Whether the date is today. */
  isToday: boolean;
  /** Events that start on this date, in start-time order. */
  events: SampleEvent[];
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Short weekday headings for the month grid, Sunday first. */
export const weekdayLabels = WEEKDAY_LABELS;

/** Parse an ISO date-time string into a Date, or null when invalid. */
export function parseEventDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** A stable YYYY-MM-DD key for a date, in local time. */
export function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Format a date as a long, readable label, e.g. "Saturday, 11 April 2026". */
export function formatLongDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Format a date as a compact label, e.g. "Sat 11 Apr". */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Format a time as a compact label, e.g. "10:00". */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format an event's start–end range, e.g. "10:00 – 12:00". */
export function formatTimeRange(event: SampleEvent): string {
  const start = parseEventDate(event.startTime);
  const end = parseEventDate(event.endTime);
  if (!start) return "Time to be confirmed";
  if (!end) return formatTime(start);
  return `${formatTime(start)} – ${formatTime(end)}`;
}

/** The month label for a date, e.g. "April 2026". */
export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

/** Group events by their start day key, preserving start-time order. */
export function groupEventsByDay(
  events: SampleEvent[],
): Map<string, SampleEvent[]> {
  const grouped = new Map<string, SampleEvent[]>();
  const sorted = [...events].sort((a, b) => {
    const aTime = parseEventDate(a.startTime)?.getTime() ?? 0;
    const bTime = parseEventDate(b.startTime)?.getTime() ?? 0;
    return aTime - bTime;
  });
  for (const event of sorted) {
    const start = parseEventDate(event.startTime);
    if (!start) continue;
    const key = dayKey(start);
    const bucket = grouped.get(key);
    if (bucket) bucket.push(event);
    else grouped.set(key, [event]);
  }
  return grouped;
}

/** Events sorted by start time, earliest first. */
export function sortEventsByStart(events: SampleEvent[]): SampleEvent[] {
  return [...events].sort((a, b) => {
    const aTime = parseEventDate(a.startTime)?.getTime() ?? 0;
    const bTime = parseEventDate(b.startTime)?.getTime() ?? 0;
    return aTime - bTime;
  });
}

/**
 * Build a six-week (42 cell) month grid for the given month, Sunday first,
 * including the leading and trailing days that complete the weeks.
 */
export function buildMonthGrid(
  monthDate: Date,
  events: SampleEvent[],
  today: Date,
): CalendarDay[] {
  const grouped = groupEventsByDay(events);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay());
  const todayKey = dayKey(today);

  const days: CalendarDay[] = [];
  for (let index = 0; index < 42; index += 1) {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + index,
    );
    const key = dayKey(date);
    days.push({
      key,
      date,
      inMonth: date.getMonth() === month,
      isToday: key === todayKey,
      events: grouped.get(key) ?? [],
    });
  }
  return days;
}

/** The first day of the month that contains the given date. */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Shift a month by a whole number of months. */
export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}
