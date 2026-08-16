/**
 * GELDS reference constants. Ticket T-0.6.
 *
 * Georgia Early Learning and Development Standards, published by DECAL.
 * https://gelds.decal.ga.gov/
 *
 * NEVER invent GELDS data. If the indicator table is not loaded, the correct
 * behaviour is to fail loudly, not to seed plausible-looking codes. A
 * fabricated standards code on a monitoring document is a customer-losing
 * event.
 */

/** The five domains. Coverage checking always counts five, never nine. */
export const DOMAIN_CODES = ['PDM', 'SED', 'APL', 'CLL', 'CD'] as const
export type DomainCode = (typeof DOMAIN_CODES)[number]

/**
 * CD is not a flat domain. Cognitive Development carries a subdomain segment
 * inside the code itself (`CD-MA1.4a`). The other four domains have no such
 * segment (`PDM6.3b`). Two code shapes, one column.
 *
 * CD holds roughly as many indicators as the other four domains combined,
 * which is why the "By area" chooser expands CD to a second level instead of
 * flattening it into one unusable list.
 */
export const CD_SUBDOMAIN_CODES = ['MA', 'SC', 'SS', 'CR', 'CP'] as const
export type CdSubdomainCode = (typeof CD_SUBDOMAIN_CODES)[number]

export const DOMAIN_NAMES: Record<DomainCode, string> = {
  PDM: 'Physical Development & Motor Skills',
  SED: 'Social & Emotional Development',
  APL: 'Approaches to Play & Learning',
  CLL: 'Communication, Language & Literacy',
  CD: 'Cognitive Development & General Knowledge',
}

export const CD_SUBDOMAIN_NAMES: Record<CdSubdomainCode, string> = {
  MA: 'Mathematics',
  SC: 'Science',
  SS: 'Social Studies',
  CR: 'Creative Development',
  CP: 'Cognitive Processes',
}

/**
 * Age band mapping. One constant, used everywhere. Never re-derived inline.
 */
export const AGE_BANDS = [
  { band: 0, label: '0–12 months', minMonths: 0, maxMonths: 12 },
  { band: 1, label: '12–24 months', minMonths: 12, maxMonths: 24 },
  { band: 2, label: '24–36 months', minMonths: 24, maxMonths: 36 },
  { band: 3, label: '36–48 months', minMonths: 36, maxMonths: 48 },
  { band: 4, label: '48–60 months', minMonths: 48, maxMonths: 60 },
] as const

export type AgeBand = (typeof AGE_BANDS)[number]['band']

export const AGE_BAND_VALUES: readonly AgeBand[] = AGE_BANDS.map((a) => a.band)

/**
 * The one true full_code pattern.
 *
 * Bounded standard number (`[1-9]\d?`) so a parser bug producing `PDM0.3b` or
 * `PDM06.3b` is caught at import rather than silently stored. Uppercase only —
 * deliberately no `i` flag.
 */
export const FULL_CODE_PATTERN =
  /^(?:(PDM|SED|APL|CLL)|CD-(MA|SC|SS|CR|CP))([1-9]\d?)\.([0-4])([a-f])?$/

/**
 * The edition new plans are written against. Stamped onto every attached code.
 *
 * More than one edition is in circulation: the 2013 age-band PDFs, this live
 * portal snapshot, and a 2026 Pre-K revision now publishing. Every attached
 * code carries the version it was chosen under, so a plan printed in one year
 * still shows what it showed. See docs/GELDS-EDITIONS.md.
 */
export const CURRENT_GELDS_VERSION = 'portal-2026-08-16'

/** The superseded edition. Retained so historical plans still render. */
export const LEGACY_GELDS_VERSION = '2013'
