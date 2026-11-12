// ---------------------------------------------------------------------
// Calendar arithmetic on plain dates (YYYY-MM-DD), done in UTC so time
// zones and daylight-saving changes can never shift a day.
// ---------------------------------------------------------------------

export interface PlainDate {
  y: number;
  m: number; // 1–12
  d: number;
}

const DAY_MS = 86_400_000;

export function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function daysInMonth(y: number, m: number): number {
  return [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
}

/** Parses "YYYY-MM-DD" strictly (rejects 2023-02-30). Years 1–9999. */
export function parseDate(value: string): PlainDate | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const date = { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
  if (date.y < 1 || date.m < 1 || date.m > 12 || date.d < 1 || date.d > daysInMonth(date.y, date.m)) return null;
  return date;
}

export function toDayNumber(p: PlainDate): number {
  const t = new Date(0);
  t.setUTCFullYear(p.y, p.m - 1, p.d);
  t.setUTCHours(0, 0, 0, 0);
  return Math.round(t.getTime() / DAY_MS);
}

export function fromDayNumber(n: number): PlainDate {
  const t = new Date(n * DAY_MS);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

export function compareDates(a: PlainDate, b: PlainDate): number {
  return toDayNumber(a) - toDayNumber(b);
}

export function formatDate(p: PlainDate): string {
  return `${String(p.y).padStart(4, "0")}-${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;
}

/** Day of week, 0 = Sunday … 6 = Saturday. */
export function weekday(p: PlainDate): number {
  return (((toDayNumber(p) + 4) % 7) + 7) % 7; // 1970-01-01 was a Thursday
}

export function todayPlain(now = new Date()): PlainDate {
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
}

/** Adds whole months, clamping the day to the target month's length (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(p: PlainDate, months: number): PlainDate {
  const index = p.y * 12 + (p.m - 1) + months;
  const y = Math.floor(index / 12);
  const m = (index % 12) + 1;
  return { y, m, d: Math.min(p.d, daysInMonth(y, m)) };
}

/**
 * Calendar difference from `start` to `end` (start ≤ end) in whole years, months and days: the largest
 * number of whole months that fits (day clamped to month length), then the remaining days.
 * 31 Jan → 1 Mar = 1 month 1 day; a 29 February start completes a year on 28 February in non-leap years.
 */
export function calendarDiff(start: PlainDate, end: PlainDate): { years: number; months: number; days: number } {
  let total = (end.y - start.y) * 12 + (end.m - start.m);
  let anchor = addMonths(start, total);
  if (compareDates(anchor, end) > 0) {
    total -= 1;
    anchor = addMonths(start, total);
  }
  return { years: Math.floor(total / 12), months: total % 12, days: toDayNumber(end) - toDayNumber(anchor) };
}

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  nextBirthday: PlainDate;
  daysToNextBirthday: number;
  /** Age they turn on the next birthday. */
  nextAge: number;
}

/** Birthday in a given year; 29 February falls on 28 February in non-leap years (matching calendarDiff). */
function birthdayIn(year: number, dob: PlainDate): PlainDate {
  return { y: year, m: dob.m, d: Math.min(dob.d, daysInMonth(year, dob.m)) };
}

export function age(dob: PlainDate, on: PlainDate): AgeResult {
  const { years, months, days } = calendarDiff(dob, on);
  const totalDays = toDayNumber(on) - toDayNumber(dob);
  let next = birthdayIn(on.y, dob);
  if (compareDates(next, on) <= 0) next = birthdayIn(on.y + 1, dob);
  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks: Math.floor(totalDays / 7),
    totalMonths: years * 12 + months,
    nextBirthday: next,
    daysToNextBirthday: toDayNumber(next) - toDayNumber(on),
    nextAge: next.y - dob.y,
  };
}

export interface DateDiffResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  weeks: number;
  remainderDays: number;
  totalMonths: number;
  /** True when the dates were entered in reverse order and swapped. */
  swapped: boolean;
}

export function dateDifference(a: PlainDate, b: PlainDate, includeEndDay = false): DateDiffResult {
  const swapped = compareDates(a, b) > 0;
  const [start, end0] = swapped ? [b, a] : [a, b];
  const end = includeEndDay ? fromDayNumber(toDayNumber(end0) + 1) : end0;
  const { years, months, days } = calendarDiff(start, end);
  const totalDays = toDayNumber(end) - toDayNumber(start);
  return { years, months, days, totalDays, weeks: Math.floor(totalDays / 7), remainderDays: totalDays % 7, totalMonths: years * 12 + months, swapped };
}

export interface DaysBetweenResult {
  totalDays: number;
  weekdays: number;
  weekendDays: number;
  swapped: boolean;
}

/** Days from a to b. With includeEndDay, both dates count (e.g. Mon–Fri = 5 days). Weekdays are Mon–Fri. */
export function daysBetween(a: PlainDate, b: PlainDate, includeEndDay: boolean): DaysBetweenResult {
  const swapped = compareDates(a, b) > 0;
  const [start, end] = swapped ? [b, a] : [a, b];
  const first = toDayNumber(start);
  const totalDays = toDayNumber(end) - first + (includeEndDay ? 1 : 0);
  // Count weekdays among the `totalDays` consecutive days starting at `start`.
  const fullWeeks = Math.floor(totalDays / 7);
  let weekdays = fullWeeks * 5;
  const startDow = weekday(start);
  for (let i = 0; i < totalDays % 7; i++) {
    const dow = (startDow + fullWeeks * 7 + i) % 7;
    if (dow !== 0 && dow !== 6) weekdays += 1;
  }
  return { totalDays, weekdays, weekendDays: totalDays - weekdays, swapped };
}
