import { describe, expect, it } from 'vitest'
import { coverageDomainOf, formatFullCode, parseFullCode } from '@/lib/gelds/code'
import { CD_SUBDOMAIN_CODES, DOMAIN_CODES } from '@/lib/gelds/constants'
import {
  ALL_SAMPLE_CODES,
  DECAL_SAMPLE_PLANS,
  OFF_BAND_CODES,
} from '../fixtures/decal-sample-plan-codes'

/**
 * Conformance against DECAL's own published sample lesson plans.
 *
 * `tests/unit/gelds-code.test.ts` proves the parser rejects what it should.
 * This file proves it accepts what actually exists — which is the failure mode
 * that costs us a customer, because a rejected real code means a teacher's plan
 * silently loses a standard.
 */

describe('every code on a real DECAL lesson plan parses', () => {
  it.each(DECAL_SAMPLE_PLANS)('$plan', ({ codes }) => {
    const rejected = codes.filter((code) => parseFullCode(code) === null)
    expect(rejected).toEqual([])
  })

  it('covers a useful number of real codes', () => {
    // A guard against someone gutting the fixture to make a failure go away.
    expect(ALL_SAMPLE_CODES.length).toBeGreaterThanOrEqual(120)
  })

  it('round-trips every real code through format', () => {
    for (const code of ALL_SAMPLE_CODES) {
      const parsed = parseFullCode(code)
      expect(parsed, code).not.toBeNull()
      expect(formatFullCode(parsed!)).toBe(code)
    }
  })
})

describe('the CD subdomain shape holds across age bands, not just 48–60 months', () => {
  // PROJECT-INSTRUCTIONS §11 open question 8.
  it('sees CD codes in every band these plans cover', () => {
    const bandsWithCd = new Set(
      DECAL_SAMPLE_PLANS.filter((p) => p.codes.some((c) => c.startsWith('CD-'))).map(
        (p) => p.ageBand
      )
    )
    expect([...bandsWithCd].sort()).toEqual([0, 2, 3, 4])
  })

  it('every CD code carries one of the five subdomains', () => {
    const cdCodes = ALL_SAMPLE_CODES.filter((c) => c.startsWith('CD'))
    expect(cdCodes.length).toBeGreaterThan(0)
    for (const code of cdCodes) {
      const parsed = parseFullCode(code)
      expect(parsed?.domainCode, code).toBe('CD')
      expect(CD_SUBDOMAIN_CODES).toContain(parsed?.subdomainCode)
    }
  })

  it('no plain-domain code ever carries a subdomain segment', () => {
    const plain = ALL_SAMPLE_CODES.filter((c) => !c.startsWith('CD'))
    for (const code of plain) {
      expect(parseFullCode(code)?.subdomainCode, code).toBeNull()
    }
  })

  it('all five subdomains appear somewhere in the samples', () => {
    const seen = new Set(
      ALL_SAMPLE_CODES.map((c) => parseFullCode(c)?.subdomainCode).filter(Boolean)
    )
    expect([...seen].sort()).toEqual([...CD_SUBDOMAIN_CODES].sort())
  })

  it('all five domains appear somewhere in the samples', () => {
    const seen = new Set(ALL_SAMPLE_CODES.map(coverageDomainOf))
    expect([...seen].sort()).toEqual([...DOMAIN_CODES].sort())
  })
})

describe('an off-band code is valid, because DECAL publishes one', () => {
  // The 0–12 month plan carries three codes whose age digit is 3 or 4. Almost
  // certainly a typo in DECAL's document — but a published one, on a plan no
  // specialist rejected. If we ever hard-fail on this, we reject DECAL's own work.
  it.each(OFF_BAND_CODES)('%s parses', (code) => {
    expect(parseFullCode(code)).not.toBeNull()
  })

  it('is only ever a soft signal — nothing here exposes a rejection flag', () => {
    for (const code of OFF_BAND_CODES) {
      const parsed = parseFullCode(code)
      expect(parsed).not.toBeNull()
      expect(Object.keys(parsed!)).not.toContain('valid')
      expect(Object.keys(parsed!)).not.toContain('rejected')
    }
  })
})
