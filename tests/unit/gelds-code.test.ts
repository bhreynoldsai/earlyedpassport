import { describe, expect, it } from 'vitest'
import {
  coverageDomainOf,
  coveredDomains,
  formatFullCode,
  isValidFullCode,
  parseFullCode,
} from '@/lib/gelds/code'
import { DOMAIN_CODES } from '@/lib/gelds/constants'

/**
 * The CD code shape is the thing most likely to be silently broken, which is
 * why it gets the most tests. Acceptance criterion 16.
 */

describe('parseFullCode', () => {
  it('parses the four domains that carry no subdomain', () => {
    expect(parseFullCode('PDM6.3b')).toEqual({
      domainCode: 'PDM',
      subdomainCode: null,
      standardNumber: 6,
      ageBand: 3,
      indicatorLetter: 'b',
      fullCode: 'PDM6.3b',
    })
  })

  it('parses CD, which carries a subdomain segment inside the code', () => {
    expect(parseFullCode('CD-MA1.4a')).toEqual({
      domainCode: 'CD',
      subdomainCode: 'MA',
      standardNumber: 1,
      ageBand: 4,
      indicatorLetter: 'a',
      fullCode: 'CD-MA1.4a',
    })
  })

  it('accepts all five CD subdomains', () => {
    for (const sub of ['MA', 'SC', 'SS', 'CR', 'CP']) {
      expect(parseFullCode(`CD-${sub}1.4a`)?.subdomainCode).toBe(sub)
    }
  })

  it('allows a missing indicator letter', () => {
    expect(parseFullCode('CLL5.4')?.indicatorLetter).toBeNull()
  })

  it('rejects a subdomain on a non-CD domain', () => {
    expect(parseFullCode('PDM-MA1.4a')).toBeNull()
  })

  it('rejects a bare CD code with no subdomain', () => {
    expect(parseFullCode('CD1.4a')).toBeNull()
  })

  it('rejects an unknown CD subdomain', () => {
    expect(parseFullCode('CD-XX1.4a')).toBeNull()
  })

  // The bounded standard number exists to catch parser bugs at import time
  // rather than printing a fabricated code on a monitoring document.
  it('rejects a zero standard number', () => {
    expect(parseFullCode('PDM0.3b')).toBeNull()
  })

  it('rejects a zero-padded standard number', () => {
    expect(parseFullCode('PDM06.3b')).toBeNull()
  })

  it('rejects a three-digit standard number', () => {
    expect(parseFullCode('PDM123.3b')).toBeNull()
  })

  it('rejects an age band outside 0-4', () => {
    expect(parseFullCode('PDM6.5b')).toBeNull()
  })

  it('rejects an indicator letter past f', () => {
    expect(parseFullCode('PDM6.3g')).toBeNull()
  })

  it('is uppercase only', () => {
    expect(parseFullCode('pdm6.3b')).toBeNull()
    expect(parseFullCode('cd-ma1.4a')).toBeNull()
  })

  it('rejects surrounding whitespace rather than trimming it', () => {
    expect(parseFullCode(' PDM6.3b ')).toBeNull()
  })
})

describe('formatFullCode', () => {
  it('round-trips every parseable code', () => {
    for (const code of ['PDM6.3b', 'SED1.0', 'APL12.2c', 'CLL5.4a', 'CD-CP1.4a']) {
      const parsed = parseFullCode(code)
      expect(parsed).not.toBeNull()
      expect(formatFullCode(parsed!)).toBe(code)
    }
  })

  it('refuses to build a CD code without a subdomain', () => {
    expect(() =>
      formatFullCode({ domainCode: 'CD', standardNumber: 1, ageBand: 4, indicatorLetter: 'a' })
    ).toThrow(/subdomain/i)
  })

  it('refuses to put a subdomain on a non-CD domain', () => {
    expect(() =>
      formatFullCode({
        domainCode: 'PDM',
        subdomainCode: 'MA',
        standardNumber: 1,
        ageBand: 4,
      })
    ).toThrow(/must not have one/i)
  })

  it('refuses an out-of-range standard number', () => {
    expect(() => formatFullCode({ domainCode: 'PDM', standardNumber: 0, ageBand: 3 })).toThrow()
    expect(() => formatFullCode({ domainCode: 'PDM', standardNumber: 100, ageBand: 3 })).toThrow()
  })
})

describe('coverage counts five domains, not nine', () => {
  it('maps every CD subdomain back to CD', () => {
    for (const sub of ['MA', 'SC', 'SS', 'CR', 'CP']) {
      expect(coverageDomainOf(`CD-${sub}1.4a`)).toBe('CD')
    }
  })

  it('covering CD-MA covers CD', () => {
    const covered = coveredDomains(['CD-MA1.4a'])
    expect(covered.has('CD')).toBe(true)
    expect(covered.size).toBe(1)
  })

  it('a full week of five domains reports five', () => {
    const covered = coveredDomains(['PDM6.3b', 'SED1.3a', 'APL2.3a', 'CLL5.3a', 'CD-SC1.3a'])
    expect(covered.size).toBe(DOMAIN_CODES.length)
  })

  it('ignores codes it cannot parse rather than inventing a domain', () => {
    expect(coveredDomains(['nonsense', 'PDM6.3b']).size).toBe(1)
  })
})

describe('isValidFullCode', () => {
  it('agrees with parseFullCode', () => {
    expect(isValidFullCode('CD-SS3.2')).toBe(true)
    expect(isValidFullCode('CD3.2')).toBe(false)
  })
})
