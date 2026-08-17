/**
 * Week math — the single source of truth. Ticket T-1.2.
 *
 * All timestamps are stored UTC and rendered in the center's timezone. Week
 * boundaries are a real bug source, so every "what week is this" question in
 * the product goes through this file. Nothing else calls `new Date()` on a
 * week boundary; ESLint enforces that.
 *
 * Weeks run Monday → Friday for planning purposes (the grid has five day
 * columns), but a week's *start* is Monday 00:00 in the center's timezone.
 */

import { addDays, format, parse } from 'date-fns'
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz'

/** `2026-08-17` — the Monday. This string is the plan's primary key component. */
export type WeekStart = string

const WEEK_START_FORMAT = 'yyyy-MM-dd'

/** Day columns on the planner grid. */
export const PLAN_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const
export type PlanDay = (typeof PLAN_DAYS)[number]

/**
 * The Monday of the week containing `instant`, as seen from `timeZone`.
 * Computed on the zoned wall-clock date so a Sunday 11pm ET instant (which is
 * already Monday in UTC) still lands in the correct week.
 */
export function weekStartFor(instant: Date, timeZone: string): WeekStart {
  const zoned = toZonedTime(instant, timeZone)
  // getDay(): 0 = Sunday … 6 = Saturday. Sunday belongs to the week that is
  // about to begin only if we shift it forward; DECAL plans run Mon–Fri, so a
  // Sunday is treated as the tail of the week that just ended.
  const dayOfWeek = zoned.getDay()
  const daysSinceMonday = (dayOfWeek + 6) % 7
  const monday = addDays(zoned, -daysSinceMonday)
  return format(monday, WEEK_START_FORMAT)
}

/** The week after the given one. "Plan next week" resolves through here. */
export function nextWeek(weekStart: WeekStart): WeekStart {
  return format(addDays(parseWeekStart(weekStart), 7), WEEK_START_FORMAT)
}

export function previousWeek(weekStart: WeekStart): WeekStart {
  return format(addDays(parseWeekStart(weekStart), -7), WEEK_START_FORMAT)
}

/** Parsed as a floating calendar date — no timezone applied. */
export function parseWeekStart(weekStart: WeekStart): Date {
  const parsed = parse(weekStart, WEEK_START_FORMAT, new Date(0))
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Not a week start: ${weekStart}`)
  }
  return parsed
}

/** The five Mon–Fri calendar dates of a plan week. */
export function weekDates(weekStart: WeekStart): Date[] {
  const monday = parseWeekStart(weekStart)
  return PLAN_DAYS.map((_, index) => addDays(monday, index))
}

/**
 * The UTC instant at which a week begins in the center's timezone. This is the
 * value to compare against `created_at` and friends. DST-correct because
 * `fromZonedTime` resolves the offset in effect on that date, not today's.
 */
export function weekStartInstant(weekStart: WeekStart, timeZone: string): Date {
  return fromZonedTime(`${weekStart}T00:00:00`, timeZone)
}

/** Exclusive end: the instant the following Monday begins. */
export function weekEndInstant(weekStart: WeekStart, timeZone: string): Date {
  return weekStartInstant(nextWeek(weekStart), timeZone)
}

/** "Week of Aug 17" — for a screen title or a printed header. */
export function formatWeekLabel(weekStart: WeekStart, timeZone: string): string {
  return formatInTimeZone(weekStartInstant(weekStart, timeZone), timeZone, 'MMM d')
}

/**
 * Today's calendar date in UTC, as YYYY-MM-DD — for date fields where the
 * few hours of skew around a center's local midnight genuinely don't matter
 * (an enrollment start date, a child's age in months), unlike week
 * boundaries, which do — that's what `weekStartFor` and a real timezone are
 * for. Exists so callers outside this file never need their own bare
 * `new Date()`; ESLint enforces that everywhere except here.
 */
export function todayUtc(): WeekStart {
  return formatInTimeZone(new Date(), 'UTC', WEEK_START_FORMAT)
}

export function isWeekStart(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  try {
    const parsed = parseWeekStart(value)
    return parsed.getDay() === 1
  } catch {
    return false
  }
}
