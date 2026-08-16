/**
 * GELDS code parsing and formatting.
 *
 * `full_code` is computed here and by the importer. It is NEVER hand-entered
 * and never typed by a teacher.
 */

import {
  AGE_BAND_VALUES,
  CD_SUBDOMAIN_CODES,
  FULL_CODE_PATTERN,
  type AgeBand,
  type CdSubdomainCode,
  type DomainCode,
} from './constants'

export interface ParsedCode {
  domainCode: DomainCode
  /** Non-null if and only if domainCode is 'CD'. */
  subdomainCode: CdSubdomainCode | null
  standardNumber: number
  ageBand: AgeBand
  /** Null when a standard has exactly one indicator at that age. */
  indicatorLetter: string | null
  fullCode: string
}

/**
 * Parse a GELDS full code. Returns null rather than throwing so callers can
 * decide how loud to be — the importer fails the whole run, the UI ignores.
 */
export function parseFullCode(input: string): ParsedCode | null {
  const match = FULL_CODE_PATTERN.exec(input)
  if (!match) return null

  const [, plainDomain, cdSubdomain, standardNumber, ageBand, indicatorLetter] = match

  // Exactly one of the two alternation branches matched.
  const domainCode = (plainDomain ?? 'CD') as DomainCode
  const subdomainCode = cdSubdomain ? (cdSubdomain as CdSubdomainCode) : null

  if (!standardNumber || !ageBand) return null

  return {
    domainCode,
    subdomainCode,
    standardNumber: Number(standardNumber),
    ageBand: Number(ageBand) as AgeBand,
    indicatorLetter: indicatorLetter ?? null,
    fullCode: input,
  }
}

export function isValidFullCode(input: string): boolean {
  return parseFullCode(input) !== null
}

/**
 * Build a full code from its parts. The single place a code string is created.
 * Throws on impossible input — a bad code must never reach a printed plan.
 */
export function formatFullCode(parts: {
  domainCode: DomainCode
  subdomainCode?: CdSubdomainCode | null
  standardNumber: number
  ageBand: AgeBand
  indicatorLetter?: string | null
}): string {
  const { domainCode, standardNumber, ageBand, indicatorLetter } = parts
  const subdomainCode = parts.subdomainCode ?? null

  if (domainCode === 'CD') {
    if (subdomainCode === null) {
      throw new Error('CD indicators must carry a subdomain (MA, SC, SS, CR or CP).')
    }
    if (!CD_SUBDOMAIN_CODES.includes(subdomainCode)) {
      throw new Error(`Unknown CD subdomain: ${String(subdomainCode)}`)
    }
  } else if (subdomainCode !== null) {
    throw new Error(`Only CD carries a subdomain; ${domainCode} must not have one.`)
  }

  if (!Number.isInteger(standardNumber) || standardNumber < 1 || standardNumber > 99) {
    throw new Error(`Standard number out of range: ${standardNumber}`)
  }
  if (!AGE_BAND_VALUES.includes(ageBand)) {
    throw new Error(`Age band out of range: ${ageBand}`)
  }
  if (
    indicatorLetter !== null &&
    indicatorLetter !== undefined &&
    !/^[a-f]$/.test(indicatorLetter)
  ) {
    throw new Error(`Indicator letter out of range: ${indicatorLetter}`)
  }

  const head = domainCode === 'CD' ? `CD-${subdomainCode}` : domainCode
  const code = `${head}${standardNumber}.${ageBand}${indicatorLetter ?? ''}`

  // Belt and braces: what we build must satisfy what we validate.
  if (!FULL_CODE_PATTERN.test(code)) {
    throw new Error(`Built an invalid GELDS code: ${code}`)
  }
  return code
}

/**
 * Which of the FIVE domains does this code count toward?
 * Covering `CD-MA` covers CD. DECAL does not require all five CD subdomains
 * weekly and neither do we.
 */
export function coverageDomainOf(fullCode: string): DomainCode | null {
  return parseFullCode(fullCode)?.domainCode ?? null
}

/** The set of domains a week's worth of attached codes covers. */
export function coveredDomains(fullCodes: readonly string[]): Set<DomainCode> {
  const covered = new Set<DomainCode>()
  for (const code of fullCodes) {
    const domain = coverageDomainOf(code)
    if (domain) covered.add(domain)
  }
  return covered
}
