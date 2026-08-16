import { describe, expect, it } from 'vitest'
import { computeDueOn, displayStateFor, getRule, COMPLIANCE_RULES } from '@/lib/compliance/rules'

const PROGRAM_START = new Date('2026-08-03T00:00:00Z')

describe('the two forms do not share a countdown', () => {
  it('Form 3231 is due 30 days from program start', () => {
    expect(getRule('form_3231').dueDays).toBe(30)
    expect(computeDueOn('form_3231', PROGRAM_START).toISOString().slice(0, 10)).toBe('2026-09-02')
  })

  it('Form 3300 is due 90 days from program start', () => {
    expect(getRule('form_3300').dueDays).toBe(90)
    expect(computeDueOn('form_3300', PROGRAM_START).toISOString().slice(0, 10)).toBe('2026-11-01')
  })

  it('the two deadlines are genuinely different', () => {
    expect(getRule('form_3231').dueDays).not.toBe(getRule('form_3300').dueDays)
  })

  it('an unknown doc type fails loudly rather than defaulting to 30', () => {
    expect(() => getRule('form_9999')).toThrow(/no compliance rule/i)
  })
})

describe("Form 3300's 12-month screening window", () => {
  it('accepts a screening from inside the 12 months before program start', () => {
    expect(
      displayStateFor('form_3300', {
        status: 'on_file',
        screenedOn: new Date('2026-02-01T00:00:00Z'),
        programStart: PROGRAM_START,
      })
    ).toBe('on_file')
  })

  it('flags a screening older than 12 months as too old to count', () => {
    expect(
      displayStateFor('form_3300', {
        status: 'on_file',
        screenedOn: new Date('2025-06-01T00:00:00Z'),
        programStart: PROGRAM_START,
      })
    ).toBe('screening_too_old')
  })

  it('accepts a screening exactly 12 months before', () => {
    expect(
      displayStateFor('form_3300', {
        status: 'on_file',
        screenedOn: new Date('2025-08-03T00:00:00Z'),
        programStart: PROGRAM_START,
      })
    ).toBe('on_file')
  })

  it('does not flag a form that is not on file yet', () => {
    expect(
      displayStateFor('form_3300', {
        status: 'missing',
        screenedOn: new Date('2020-01-01T00:00:00Z'),
        programStart: PROGRAM_START,
      })
    ).toBe('missing')
  })

  it('never applies the screening rule to Form 3231', () => {
    expect(
      displayStateFor('form_3231', {
        status: 'on_file',
        screenedOn: new Date('2010-01-01T00:00:00Z'),
        programStart: PROGRAM_START,
      })
    ).toBe('on_file')
  })
})

describe('compliance is display and reminder only', () => {
  it('exposes no blocking flag of any kind', () => {
    // If a `blocks`, `required`, or `preventsEnrollment` field ever appears on
    // a rule, someone has started building the thing DECAL prohibits.
    for (const rule of Object.values(COMPLIANCE_RULES)) {
      const keys = Object.keys(rule)
      expect(keys).not.toContain('blocks')
      expect(keys).not.toContain('required')
      expect(keys).not.toContain('preventsEnrollment')
    }
  })

  it('every display state is one a pill can show without red', () => {
    const states = [
      displayStateFor('form_3231', { status: 'missing', programStart: PROGRAM_START }),
      displayStateFor('form_3231', { status: 'appointment_card', programStart: PROGRAM_START }),
      displayStateFor('form_3231', { status: 'on_file', programStart: PROGRAM_START }),
      displayStateFor('form_3231', { status: 'expired', programStart: PROGRAM_START }),
    ]
    expect(states).toEqual(['missing', 'appointment_card', 'on_file', 'expired'])
  })
})
