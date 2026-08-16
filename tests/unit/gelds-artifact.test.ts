import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parsePortalIndicators, parsePortalStandards } from '../../supabase/gelds/portal'
import { parseAgeBandPdf } from '../../supabase/gelds/parse'
import { GELDS_PDF_SOURCES } from '../../supabase/gelds/sources'
import { KNOWN_DUPLICATES } from '../../supabase/gelds/validate'

/**
 * The committed source must still produce the committed artifact.
 *
 * This exists because it once did not. Prettier reformatted
 * `supabase/gelds/source/portal-search.html` after the artifact was generated
 * and before it was committed — rewriting `id='pnlIndicator_1'` to
 * `id="pnlIndicator_1"` and wrapping the attributes across lines. The artifact
 * stayed correct, the parser stayed correct, and the source no longer produced
 * one from the other. Nothing failed, because nothing re-ran the parse:
 * `.prettierignore` was added later, which stopped the damage spreading but did
 * not undo it.
 *
 * The failure mode is the quiet one this project cares most about. A stale or
 * mangled source means the next person to run `--fetch` gets a different answer
 * than the artifact claims, and GELDS codes on a monitoring document are a
 * customer-losing thing to get wrong. So the check is not "does it parse" but
 * "does it parse to exactly what we shipped".
 */

const ARTIFACT_DIR = new URL('../../supabase/gelds/', import.meta.url).pathname
const SOURCE_DIR = `${ARTIFACT_DIR}source/`

interface Artifact {
  geldsVersion: string
  total: number
  indicators: {
    domainCode: string
    subdomainCode: string | null
    standardNumber: number
    ageBand: number
    indicatorLetter: string | null
    fullCode: string
    indicatorText: string
  }[]
}

function readArtifact(name: string): Artifact {
  return JSON.parse(readFileSync(`${ARTIFACT_DIR}${name}`, 'utf8')) as Artifact
}

/** The importer drops documented duplicates before writing. Mirror that here. */
function applyKnownDuplicates<T extends { fullCode: string; sourcePage?: number | null }>(
  indicators: T[],
  version: string
): T[] {
  const allow = KNOWN_DUPLICATES.filter((d) => d.version === version)
  if (allow.length === 0) return indicators
  return indicators.filter((indicator) => {
    const known = allow.find((d) => d.fullCode === indicator.fullCode)
    return !known || indicator.sourcePage === known.keepSourceId
  })
}

describe('the committed portal source reproduces the committed artifact', () => {
  const version = 'portal-2026-08-16'
  const artifact = readArtifact(`gelds-${version}.json`)

  const standards = parsePortalStandards(readFileSync(`${SOURCE_DIR}portal-main.html`, 'utf8'))
  const parsed = parsePortalIndicators(
    readFileSync(`${SOURCE_DIR}portal-search.html`, 'utf8'),
    standards,
    version
  )
  const indicators = applyKnownDuplicates([...parsed.indicators], version)

  it('finds the 52 standards the filter form lists', () => {
    expect(standards.size).toBe(52)
  })

  it('parses a card for every record the portal says it has', () => {
    // The portal prints its own total. Parsing fewer is what a silently
    // truncated fetch looks like, and it is the reason this number is checked
    // against the page rather than against a constant we chose.
    expect(parsed.reportedTotal).toBe(680)
    expect(parsed.indicators.length).toBe(680)
  })

  it('matches the artifact indicator for indicator', () => {
    expect(indicators.length).toBe(artifact.total)

    const fromSource = [...indicators].sort((a, b) => a.fullCode.localeCompare(b.fullCode))
    const fromArtifact = [...artifact.indicators].sort((a, b) =>
      a.fullCode.localeCompare(b.fullCode)
    )

    // Compare the fields that reach the database. sourcePage is provenance and
    // deliberately not part of the contract.
    const shape = (i: (typeof fromArtifact)[number]) => ({
      domainCode: i.domainCode,
      subdomainCode: i.subdomainCode,
      standardNumber: i.standardNumber,
      ageBand: i.ageBand,
      indicatorLetter: i.indicatorLetter,
      fullCode: i.fullCode,
      indicatorText: i.indicatorText,
    })

    expect(fromSource.map(shape)).toEqual(fromArtifact.map(shape))
  })

  it('carries no empty indicator text', () => {
    // The specific corruption that started this: reformatting can collapse a
    // text node without changing the surrounding markup at all.
    for (const indicator of indicators) {
      expect(indicator.indicatorText.trim().length, indicator.fullCode).toBeGreaterThan(0)
    }
  })
})

// The 2013 edition needs poppler. CI does not install it, and a test that
// silently passes when its dependency is absent is worse than no test — so it
// skips loudly rather than quietly.
function hasPdftotext(): boolean {
  try {
    execFileSync('pdftotext', ['-v'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

describe.skipIf(!hasPdftotext())('the committed 2013 PDFs reproduce their artifact', () => {
  it('matches the artifact indicator for indicator', () => {
    const artifact = readArtifact('gelds-2013.json')

    const indicators = GELDS_PDF_SOURCES.flatMap(
      (source) =>
        parseAgeBandPdf(`${SOURCE_DIR}${source.file}`, source.file, source.ageBand, '2013')
          .indicators
    )

    expect(indicators.length).toBe(artifact.total)

    const codes = indicators.map((i) => i.fullCode).sort()
    const expected = artifact.indicators.map((i) => i.fullCode).sort()
    expect(codes).toEqual(expected)
  })
})
