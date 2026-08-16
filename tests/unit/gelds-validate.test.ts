import { describe, expect, it } from 'vitest'
import { validate } from '@/supabase/gelds/validate'
import type { RawIndicator } from '@/supabase/gelds/parse'

/**
 * The gates are what stand between a bad parse and a fabricated standards code
 * on a monitoring document. They get tested like the security boundary does.
 */

function indicator(overrides: Partial<RawIndicator> = {}): RawIndicator {
  return {
    geldsVersion: 'test',
    domainCode: 'PDM',
    subdomainCode: null,
    strandName: 'Health and Well-Being',
    standardNumber: 1,
    standardText: 'The child will practice healthy and safe habits.',
    ageBand: 4,
    indicatorLetter: 'a',
    fullCode: 'PDM1.4a',
    indicatorText: 'Stays awake and alert during the day.',
    sourceFile: 'test.pdf',
    sourcePage: 1,
    ...overrides,
  }
}

/** A minimal set that satisfies every hard gate, to mutate in each test. */
function completeSet(): RawIndicator[] {
  const rows: RawIndicator[] = [
    indicator({ domainCode: 'PDM', fullCode: 'PDM1.4a' }),
    indicator({ domainCode: 'SED', fullCode: 'SED1.4a' }),
    indicator({ domainCode: 'APL', fullCode: 'APL1.4a' }),
    indicator({ domainCode: 'CLL', fullCode: 'CLL1.4a' }),
  ]
  for (const sub of ['MA', 'SC', 'SS', 'CR', 'CP'] as const) {
    rows.push(indicator({ domainCode: 'CD', subdomainCode: sub, fullCode: `CD-${sub}1.4a` }))
  }
  // Cover every age band so the soft matrix stays quiet.
  for (const band of [0, 1, 2, 3] as const) {
    for (const d of ['PDM', 'SED', 'APL', 'CLL'] as const) {
      rows.push(indicator({ domainCode: d, ageBand: band, fullCode: `${d}1.${band}a` }))
    }
    rows.push(
      indicator({
        domainCode: 'CD',
        subdomainCode: 'MA',
        ageBand: band,
        fullCode: `CD-MA1.${band}a`,
      })
    )
  }
  return rows
}

describe('a clean set passes', () => {
  it('reports no failures', () => {
    const report = validate(completeSet())
    expect(report.failures).toEqual([])
    expect(report.passed).toBe(true)
  })

  it('counts every domain and age band', () => {
    const report = validate(completeSet())
    expect(report.coverage.CD[4]).toBe(5)
    expect(report.total).toBe(completeSet().length)
  })
})

describe('hard gate: full_code shape', () => {
  it.each(['PDM0.4a', 'PDM06.4a', 'pdm1.4a', 'PDM1.5a', 'PDM1.4g', 'CD1.4a'])(
    'rejects %s',
    (bad) => {
      const report = validate([...completeSet(), indicator({ fullCode: bad })])
      expect(report.passed).toBe(false)
      expect(report.failures.map((f) => f.gate)).toContain('full_code shape')
    }
  )
})

describe('hard gate: duplicates', () => {
  it('fails on a repeated code', () => {
    const report = validate([...completeSet(), indicator({ fullCode: 'PDM1.4a' })])
    expect(report.passed).toBe(false)
    expect(report.failures.map((f) => f.gate)).toContain('duplicate full_code')
  })

  it('says when the duplicate carries different wording', () => {
    const report = validate([
      ...completeSet(),
      indicator({ fullCode: 'PDM1.4a', indicatorText: 'Something else entirely.' }),
    ])
    const failure = report.failures.find((f) => f.gate === 'duplicate full_code')
    expect(failure?.detail).toMatch(/DIFFERENT text/)
  })
})

describe('hard gate: all five domains and all five CD subdomains', () => {
  it('fails when a domain is missing', () => {
    const rows = completeSet().filter((r) => r.domainCode !== 'APL')
    const report = validate(rows)
    expect(report.passed).toBe(false)
    expect(report.failures.map((f) => f.gate)).toContain('domain coverage')
  })

  it('fails when a CD subdomain is missing', () => {
    const rows = completeSet().filter((r) => r.subdomainCode !== 'CP')
    const report = validate(rows)
    expect(report.passed).toBe(false)
    expect(report.failures.map((f) => f.gate)).toContain('CD subdomain coverage')
  })
})

describe('hard gate: subdomain only on CD', () => {
  it('fails when a plain domain carries a subdomain', () => {
    const report = validate([
      ...completeSet(),
      indicator({ domainCode: 'PDM', subdomainCode: 'MA', fullCode: 'PDM2.4a' }),
    ])
    expect(report.failures.map((f) => f.gate)).toContain('subdomain only on CD')
  })

  it('fails when CD carries no subdomain', () => {
    const report = validate([
      ...completeSet(),
      indicator({ domainCode: 'CD', subdomainCode: null, fullCode: 'CD-MA2.4a' }),
    ])
    expect(report.failures.map((f) => f.gate)).toContain('subdomain only on CD')
  })
})

describe('hard gate: indicator text present', () => {
  it('fails on an empty indicator', () => {
    const report = validate([
      ...completeSet(),
      indicator({ fullCode: 'PDM9.4a', indicatorText: '   ' }),
    ])
    expect(report.failures.map((f) => f.gate)).toContain('indicator text present')
  })
})

describe('soft gates report but never fail the import', () => {
  it('notes a missing domain × band cell without failing', () => {
    const rows = completeSet().filter((r) => !(r.domainCode === 'SED' && r.ageBand === 2))
    const report = validate(rows)
    expect(report.passed).toBe(true)
    expect(report.softFindings.join(' ')).toMatch(/No SED indicators at age band 2/)
  })

  it('skips the count comparison when there is no prior version', () => {
    const report = validate(completeSet())
    expect(report.passed).toBe(true)
    expect(report.softFindings.join(' ')).toMatch(/No prior version recorded/)
  })

  it('flags a count that moved more than 10% from the prior version', () => {
    const report = validate(completeSet(), { version: '2013', total: 1000 })
    expect(report.passed).toBe(true)
    expect(report.softFindings.join(' ')).toMatch(/silently truncated parse/)
  })

  it('stays quiet when the count barely moved', () => {
    const rows = completeSet()
    const report = validate(rows, { version: '2013', total: rows.length })
    expect(report.softFindings.join(' ')).not.toMatch(/silently truncated/)
  })
})
