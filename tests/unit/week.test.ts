import { describe, expect, it } from 'vitest'
import {
  formatWeekLabel,
  isWeekStart,
  nextWeek,
  previousWeek,
  weekDates,
  weekEndInstant,
  weekStartFor,
  weekStartInstant,
} from '@/lib/week'

const ATLANTA = 'America/New_York'

describe('weekStartFor', () => {
  it('returns the Monday of the containing week', () => {
    // Wednesday 2026-08-19 12:00 ET
    expect(weekStartFor(new Date('2026-08-19T16:00:00Z'), ATLANTA)).toBe('2026-08-17')
  })

  it('treats Monday as its own week start', () => {
    expect(weekStartFor(new Date('2026-08-17T16:00:00Z'), ATLANTA)).toBe('2026-08-17')
  })

  it('treats Sunday as the tail of the week that just ended', () => {
    expect(weekStartFor(new Date('2026-08-23T16:00:00Z'), ATLANTA)).toBe('2026-08-17')
  })

  // The bug this file exists to prevent: a Sunday-night instant in Atlanta is
  // already Monday in UTC, and naive code files it under the wrong week.
  it('uses the center timezone, not UTC, to decide the week', () => {
    const sundayNightAtlanta = new Date('2026-08-24T02:30:00Z') // Sun 22:30 ET
    expect(weekStartFor(sundayNightAtlanta, ATLANTA)).toBe('2026-08-17')
    expect(weekStartFor(sundayNightAtlanta, 'UTC')).toBe('2026-08-24')
  })
})

describe('nextWeek / previousWeek', () => {
  it('moves by exactly seven days', () => {
    expect(nextWeek('2026-08-17')).toBe('2026-08-24')
    expect(previousWeek('2026-08-17')).toBe('2026-08-10')
  })

  it('crosses a month boundary', () => {
    expect(nextWeek('2026-08-31')).toBe('2026-09-07')
  })

  it('crosses a year boundary', () => {
    expect(nextWeek('2026-12-28')).toBe('2027-01-04')
  })

  // Spring forward is 2026-03-08 in the US; a naive +7*24h lands on Sunday.
  it('crosses the spring DST boundary without slipping a day', () => {
    expect(nextWeek('2026-03-02')).toBe('2026-03-09')
  })

  it('crosses the autumn DST boundary without slipping a day', () => {
    expect(nextWeek('2026-10-26')).toBe('2026-11-02')
  })
})

describe('weekStartInstant', () => {
  it('resolves the offset in effect on that date, not today', () => {
    // Standard time: ET is UTC-5.
    expect(weekStartInstant('2026-01-05', ATLANTA).toISOString()).toBe('2026-01-05T05:00:00.000Z')
    // Daylight time: ET is UTC-4.
    expect(weekStartInstant('2026-07-06', ATLANTA).toISOString()).toBe('2026-07-06T04:00:00.000Z')
  })

  it('gives a week that ends where the next one begins', () => {
    expect(weekEndInstant('2026-08-17', ATLANTA).toISOString()).toBe(
      weekStartInstant('2026-08-24', ATLANTA).toISOString()
    )
  })

  it('a week containing a DST shift is not exactly 168 hours', () => {
    const start = weekStartInstant('2026-03-02', ATLANTA).getTime()
    const end = weekEndInstant('2026-03-02', ATLANTA).getTime()
    expect((end - start) / 3_600_000).toBe(167)
  })
})

describe('weekDates', () => {
  it('gives five Monday-to-Friday dates', () => {
    const dates = weekDates('2026-08-17')
    expect(dates).toHaveLength(5)
    expect(dates.map((d) => d.getDate())).toEqual([17, 18, 19, 20, 21])
  })
})

describe('formatWeekLabel', () => {
  it('reads as a person would say it', () => {
    expect(formatWeekLabel('2026-08-17', ATLANTA)).toBe('Aug 17')
  })
})

describe('isWeekStart', () => {
  it('accepts a Monday', () => {
    expect(isWeekStart('2026-08-17')).toBe(true)
  })

  it('rejects any other day', () => {
    expect(isWeekStart('2026-08-18')).toBe(false)
  })

  it('rejects a malformed string', () => {
    expect(isWeekStart('next week')).toBe(false)
  })
})
