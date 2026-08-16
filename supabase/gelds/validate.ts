/**
 * Import validation. Ticket T-0.6, step 3.
 *
 * NEVER INVENT GELDS DATA. If something here is wrong, the correct outcome is a
 * loud failure and an empty table — not a partial load of plausible-looking
 * codes. A fabricated standards code on a monitoring document is a
 * customer-losing event.
 *
 * Hard gates fail the whole import. Soft gates report and let a human judge,
 * because no baseline exists yet for what "normal" looks like.
 */

import {
  FULL_CODE_PATTERN,
  AGE_BANDS,
  CD_SUBDOMAIN_CODES,
  DOMAIN_CODES,
} from '@/lib/gelds/constants'
import type { AgeBand, DomainCode } from '@/lib/gelds/constants'
import type { RawIndicator } from './parse'

export interface Failure {
  gate: string
  detail: string
}

export interface ValidationReport {
  total: number
  failures: Failure[]
  softFindings: string[]
  /** domain → age band → count */
  coverage: Record<DomainCode, Record<AgeBand, number>>
  bySubdomain: Record<string, number>
  passed: boolean
}

export interface PriorVersionStats {
  version: string
  total: number
}

export function validate(
  indicators: readonly RawIndicator[],
  prior?: PriorVersionStats
): ValidationReport {
  const failures: Failure[] = []
  const softFindings: string[] = []

  // --- HARD GATE 1: every code matches the one true pattern --------------
  // Bounded standard number, so a parser bug producing PDM0.3b or PDM06.3b is
  // caught here rather than printed on a plan. Uppercase only.
  const malformed = indicators.filter((i) => !FULL_CODE_PATTERN.test(i.fullCode))
  if (malformed.length > 0) {
    failures.push({
      gate: 'full_code shape',
      detail: `${malformed.length} code(s) do not match the pattern: ${malformed
        .slice(0, 10)
        .map((i) => `${i.fullCode} (${i.sourceFile} p${i.sourcePage})`)
        .join(', ')}`,
    })
  }

  // --- HARD GATE 2: no duplicate full_code within a version ---------------
  const seen = new Map<string, RawIndicator>()
  const duplicates: string[] = []
  for (const i of indicators) {
    const existing = seen.get(i.fullCode)
    if (existing) {
      const sameText = existing.indicatorText === i.indicatorText
      duplicates.push(
        `${i.fullCode} (${existing.sourceFile} p${existing.sourcePage} and ` +
          `${i.sourceFile} p${i.sourcePage}${sameText ? ', identical text' : ', DIFFERENT text'})`
      )
    } else {
      seen.set(i.fullCode, i)
    }
  }
  if (duplicates.length > 0) {
    failures.push({
      gate: 'duplicate full_code',
      detail: `${duplicates.length} duplicate(s): ${duplicates.slice(0, 10).join('; ')}`,
    })
  }

  // --- HARD GATE 3: all five domains, all five CD subdomains --------------
  const presentDomains = new Set(indicators.map((i) => i.domainCode))
  const missingDomains = DOMAIN_CODES.filter((d) => !presentDomains.has(d))
  if (missingDomains.length > 0) {
    failures.push({
      gate: 'domain coverage',
      detail: `Missing domain(s): ${missingDomains.join(', ')}`,
    })
  }

  const presentSubs = new Set(indicators.map((i) => i.subdomainCode).filter(Boolean))
  const missingSubs = CD_SUBDOMAIN_CODES.filter((s) => !presentSubs.has(s))
  if (missingSubs.length > 0) {
    failures.push({
      gate: 'CD subdomain coverage',
      detail: `Missing CD subdomain(s): ${missingSubs.join(', ')}`,
    })
  }

  // --- HARD GATE 4: subdomain non-null iff domain is CD -------------------
  // Mirrors the subdomain_only_on_cd CHECK constraint in migration 0003. If
  // this passes here and the insert still fails, the two have drifted.
  const badSubdomain = indicators.filter((i) =>
    i.domainCode === 'CD' ? i.subdomainCode === null : i.subdomainCode !== null
  )
  if (badSubdomain.length > 0) {
    failures.push({
      gate: 'subdomain only on CD',
      detail: `${badSubdomain.length} row(s) violate the rule: ${badSubdomain
        .slice(0, 10)
        .map((i) => `${i.fullCode} → subdomain=${i.subdomainCode ?? 'null'}`)
        .join(', ')}`,
    })
  }

  // --- HARD GATE 5: no empty indicator text ------------------------------
  // Not in the spec's list, but an indicator with no wording is useless to a
  // teacher and indicates the parser lost a table cell.
  const empty = indicators.filter((i) => i.indicatorText.trim().length === 0)
  if (empty.length > 0) {
    failures.push({
      gate: 'indicator text present',
      detail: `${empty.length} indicator(s) have no text: ${empty
        .slice(0, 10)
        .map((i) => `${i.fullCode} (${i.sourceFile} p${i.sourcePage})`)
        .join(', ')}`,
    })
  }

  // --- SOFT: domain × age-band coverage matrix ---------------------------
  // A human eyeballs this. It becomes a hard gate only once a baseline is
  // recorded, because nobody has verified every domain has an indicator at
  // every band.
  const coverage = Object.fromEntries(
    DOMAIN_CODES.map((d) => [
      d,
      Object.fromEntries(AGE_BANDS.map((b) => [b.band, 0])) as Record<AgeBand, number>,
    ])
  ) as Record<DomainCode, Record<AgeBand, number>>

  for (const i of indicators) {
    coverage[i.domainCode][i.ageBand] += 1
  }

  for (const d of DOMAIN_CODES) {
    for (const b of AGE_BANDS) {
      if (coverage[d][b.band] === 0) {
        softFindings.push(`No ${d} indicators at age band ${b.band} (${b.label})`)
      }
    }
  }

  const bySubdomain: Record<string, number> = {}
  for (const s of CD_SUBDOMAIN_CODES) {
    bySubdomain[s] = indicators.filter((i) => i.subdomainCode === s).length
  }

  // --- SOFT: count within 10% of the previous version --------------------
  // Catches a silently truncated parse. Skipped when there is no prior version.
  if (prior) {
    const delta = Math.abs(indicators.length - prior.total) / prior.total
    if (delta > 0.1) {
      softFindings.push(
        `Indicator count moved ${(delta * 100).toFixed(1)}% from ${prior.version} ` +
          `(${prior.total} → ${indicators.length}). A silently truncated parse looks like this.`
      )
    }
  } else {
    softFindings.push(
      'No prior version recorded — count comparison skipped (expected on first import).'
    )
  }

  return {
    total: indicators.length,
    failures,
    softFindings,
    coverage,
    bySubdomain,
    passed: failures.length === 0,
  }
}

/** The report a human reads before letting anything reach the database. */
export function formatReport(report: ValidationReport, version: string): string {
  const out: string[] = []
  out.push('')
  out.push('='.repeat(76))
  out.push(`GELDS IMPORT VALIDATION — ${version}`)
  out.push('='.repeat(76))
  out.push('')
  out.push(`Total indicators parsed: ${report.total}`)
  out.push('')

  out.push('Domain × age band')
  out.push('-'.repeat(76))
  const header = [
    'domain'.padEnd(8),
    ...AGE_BANDS.map((b) => String(b.band).padStart(7)),
    'total'.padStart(8),
  ]
  out.push(header.join(''))
  for (const d of DOMAIN_CODES) {
    const row = [d.padEnd(8)]
    let total = 0
    for (const b of AGE_BANDS) {
      const n = report.coverage[d][b.band]
      total += n
      row.push(String(n).padStart(7))
    }
    row.push(String(total).padStart(8))
    out.push(row.join(''))
  }
  const colTotals = AGE_BANDS.map((b) =>
    DOMAIN_CODES.reduce((sum, d) => sum + report.coverage[d][b.band], 0)
  )
  out.push(
    [
      'all'.padEnd(8),
      ...colTotals.map((n) => String(n).padStart(7)),
      String(report.total).padStart(8),
    ].join('')
  )
  out.push('')
  out.push('Age bands: 0 = 0–12mo, 1 = 12–24mo, 2 = 24–36mo, 3 = 36–48mo, 4 = 48–60mo')
  out.push('')

  out.push('CD subdomains (all five roll up into the single CD domain for coverage)')
  out.push('-'.repeat(76))
  for (const [sub, n] of Object.entries(report.bySubdomain)) {
    out.push(`  CD-${sub}  ${String(n).padStart(5)}`)
  }
  out.push('')

  if (report.softFindings.length > 0) {
    out.push('Soft findings — reported, not fatal. A human decides.')
    out.push('-'.repeat(76))
    for (const f of report.softFindings) out.push(`  • ${f}`)
    out.push('')
  }

  out.push('-'.repeat(76))
  if (report.passed) {
    out.push('HARD GATES: PASSED')
  } else {
    out.push('HARD GATES: FAILED — nothing will be loaded')
    out.push('')
    for (const f of report.failures) {
      out.push(`  ✗ ${f.gate}`)
      out.push(`    ${f.detail}`)
    }
  }
  out.push('='.repeat(76))
  out.push('')
  return out.join('\n')
}
