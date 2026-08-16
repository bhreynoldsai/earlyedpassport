/**
 * The live GELDS portal parser. Ticket T-0.6, second source.
 *
 * The five age-band PDFs are the **2013** edition. The portal at
 * `gelds.decal.ga.gov/GELDS` carries a newer inventory — 679 unique codes
 * against the PDFs' 657, with whole standards retired and added. See
 * docs/GELDS-EDITIONS.md for the full comparison and why we switched.
 *
 * This parser reads DECAL's HTML directly. It does not depend on the workbook
 * snapshot that surfaced the discrepancy — that was the tip-off, not the
 * source. Everything here comes from the portal.
 *
 * Two pages:
 *   - `/GELDS`        the filter form, which carries all 52 standards and
 *                     their full statements as checkbox labels.
 *   - `/GELDS/Search` every indicator card, unpaginated, when asked for all
 *                     five age groups at once.
 *
 * Less fragile than the PDF path: no bounding boxes, no vertically-centred
 * table cells, no wrapped headings. If DECAL ever ships a real export this
 * becomes redundant, which is why asking for one is still on the open list.
 */

import { parseFullCode } from '@/lib/gelds/code'
import { AGE_BANDS, type AgeBand } from '@/lib/gelds/constants'
import type { RawIndicator } from './parse'

export const PORTAL_MAIN_URL = 'https://gelds.decal.ga.gov/GELDS'
export const PORTAL_SEARCH_URL =
  'https://gelds.decal.ga.gov/GELDS/Search?ageGroupIds=1%7C2%7C3%7C4%7C5'

/** The portal writes age groups exactly like this. */
const AGE_LABEL_TO_BAND: Record<string, AgeBand> = {
  '0-12 months': 0,
  '12-24 months': 1,
  '24-36 months': 2,
  '36-48 months': 3,
  '48-60 months': 4,
}

function decodeEntities(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&apos;|&#39;/g, "'")
}

/**
 * The portal's markup puts line breaks inside sentences, so a full stop can end
 * up on its own line. Collapsing whitespace leaves " ." behind; that is layout,
 * not wording, so it is closed up. No other editorial change is made — DECAL's
 * typos and grammar are reproduced exactly, because `indicator_text` is their
 * verbatim wording and is never edited.
 */
function normalise(input: string): string {
  return decodeEntities(input)
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim()
}

/**
 * Standard statements, from the filter form.
 * `<label ...>CLL9 - The child will demonstrate emerging writing skills.</label>`
 */
export function parsePortalStandards(html: string): Map<string, string> {
  const standards = new Map<string, string>()
  const pattern = /value="((?:PDM|SED|APL|CLL|CD-(?:MA|SC|SS|CR|CP))\d{1,2})\s*-\s*([^"]+)"/g

  for (const match of html.matchAll(pattern)) {
    const code = match[1]!
    const text = normalise(match[2] ?? '')
    if (text) standards.set(code, text)
  }
  return standards
}

export interface PortalParseResult {
  indicators: RawIndicator[]
  warnings: string[]
  /** What the portal itself claims it returned, for a count cross-check. */
  reportedTotal: number | null
}

/**
 * Indicator cards, from the all-ages search.
 *
 * Each card is a `pnlIndicator_<id>` block carrying the code in its header, the
 * wording in its body, and the age group and strand in its footer. The portal's
 * own record id is kept as provenance — it is the only thing that tells two
 * records with the same code apart, and the portal has one such pair.
 */
export function parsePortalIndicators(
  html: string,
  standards: Map<string, string>,
  geldsVersion: string
): PortalParseResult {
  const warnings: string[] = []
  const indicators: RawIndicator[] = []

  const totalMatch = /Total Records:\s*(\d+)/.exec(html)
  const reportedTotal = totalMatch ? Number(totalMatch[1]) : null

  const chunks = html.split(/id='pnlIndicator_/).slice(1)

  for (const chunk of chunks) {
    const sourceId = /^(\d+)/.exec(chunk)?.[1]
    if (!sourceId) continue

    const rawCode = /class="card-header[^"]*"[^>]*>\s*([^\s<][^<]*?)\s*</.exec(chunk)?.[1]
    const rawBody = /class="card-body"[^>]*>([\s\S]*?)<\/div>/.exec(chunk)?.[1]
    if (!rawCode || rawBody === undefined) {
      warnings.push(`Card ${sourceId} had no code or no body and was skipped`)
      continue
    }

    const fullCode = normalise(rawCode)
    const parsed = parseFullCode(fullCode)
    if (!parsed) {
      warnings.push(`Card ${sourceId} carried an unparseable code: ${fullCode}`)
      continue
    }

    const indicatorText = normalise(rawBody)
    if (!indicatorText) {
      warnings.push(`${fullCode} (card ${sourceId}) had no wording`)
    }

    // Footer: every simple text div. One is the age group; the last of the rest
    // is the strand.
    const footer = /class="card-footer"[^>]*>([\s\S]*?)$/.exec(chunk)?.[1] ?? ''
    const texts = [...footer.matchAll(/>([^<>]+)</g)]
      .map((m) => normalise(m[1] ?? ''))
      .filter(Boolean)

    const ageLabel = texts.find((t) => t in AGE_LABEL_TO_BAND)
    const strandName = texts.filter((t) => !(t in AGE_LABEL_TO_BAND)).at(-1) ?? null

    if (!ageLabel) {
      warnings.push(`${fullCode} (card ${sourceId}) had no age group and was skipped`)
      continue
    }
    const ageBand = AGE_LABEL_TO_BAND[ageLabel]!

    if (ageBand !== parsed.ageBand) {
      warnings.push(`${fullCode} sits under "${ageLabel}" but its code says band ${parsed.ageBand}`)
    }

    const standardKey =
      parsed.domainCode === 'CD'
        ? `CD-${parsed.subdomainCode}${parsed.standardNumber}`
        : `${parsed.domainCode}${parsed.standardNumber}`

    indicators.push({
      geldsVersion,
      domainCode: parsed.domainCode,
      subdomainCode: parsed.subdomainCode,
      strandName,
      standardNumber: parsed.standardNumber,
      standardText: standards.get(standardKey) ?? null,
      ageBand: parsed.ageBand,
      indicatorLetter: parsed.indicatorLetter,
      fullCode,
      indicatorText,
      sourceFile: 'portal',
      // The portal's own record id, so a row can be traced back to a card.
      sourcePage: Number(sourceId),
    })
  }

  if (reportedTotal !== null && indicators.length !== reportedTotal) {
    warnings.push(
      `Portal says ${reportedTotal} records but ${indicators.length} were parsed. ` +
        'A silently truncated fetch looks exactly like this.'
    )
  }

  const bands = new Set(indicators.map((i) => i.ageBand))
  for (const band of AGE_BANDS) {
    if (!bands.has(band.band)) {
      warnings.push(`No indicators at age band ${band.band} (${band.label})`)
    }
  }

  return { indicators, warnings, reportedTotal }
}
