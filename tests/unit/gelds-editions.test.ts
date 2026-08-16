import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CURRENT_GELDS_VERSION, LEGACY_GELDS_VERSION } from '@/lib/gelds/constants'
import { CURRENT_EDITION, EDITIONS } from '@/supabase/gelds/sources'
import { KNOWN_DUPLICATES } from '@/supabase/gelds/validate'
import { parseFullCode } from '@/lib/gelds/code'

/**
 * Pins the two editions against each other.
 *
 * We shipped the 2013 edition by accident and only caught it because Bernard
 * supplied a portal snapshot. These tests make the difference explicit, so the
 * next time an edition moves it shows up as a failing test rather than as a
 * teacher attaching a code DECAL retired.
 *
 * See docs/GELDS-EDITIONS.md.
 */

interface Artifact {
  geldsVersion: string
  total: number
  indicators: { fullCode: string; indicatorText: string; ageBand: number }[]
}

function load(name: string): Artifact {
  return JSON.parse(
    readFileSync(new URL(`../../supabase/gelds/${name}`, import.meta.url).pathname, 'utf8')
  ) as Artifact
}

const portal = load('gelds-portal-2026-08-16.json')
const legacy = load('gelds-2013.json')

const portalCodes = new Set(portal.indicators.map((i) => i.fullCode))
const legacyCodes = new Set(legacy.indicators.map((i) => i.fullCode))

describe('the app writes new plans against the portal edition', () => {
  it('CURRENT_GELDS_VERSION matches the importer', () => {
    expect(CURRENT_GELDS_VERSION).toBe(CURRENT_EDITION)
    expect(EDITIONS[CURRENT_EDITION]).toBeDefined()
  })

  it('keeps the superseded edition addressable rather than deleting it', () => {
    expect(LEGACY_GELDS_VERSION).toBe('2013')
    expect(legacy.total).toBeGreaterThan(0)
  })

  it('labels each artifact with the version its rows carry', () => {
    expect(portal.geldsVersion).toBe(CURRENT_GELDS_VERSION)
    expect(legacy.geldsVersion).toBe(LEGACY_GELDS_VERSION)
  })
})

describe('the two editions genuinely differ', () => {
  it('has 679 codes on the portal and 657 in 2013', () => {
    expect(portal.total).toBe(679)
    expect(legacy.total).toBe(657)
  })

  it('holds codes DECAL has since retired, and codes it has since added', () => {
    const retired = [...legacyCodes].filter((c) => !portalCodes.has(c))
    const added = [...portalCodes].filter((c) => !legacyCodes.has(c))
    expect(retired).toHaveLength(49)
    expect(added).toHaveLength(71)
  })

  it('pruned CLL8 and CD-MA3 hard without removing them', () => {
    const count = (codes: Set<string>, prefix: string) =>
      [...codes].filter((c) => c.startsWith(prefix)).length
    expect(count(legacyCodes, 'CLL8.')).toBe(20)
    expect(count(portalCodes, 'CLL8.')).toBe(6)
    expect(count(legacyCodes, 'CD-MA3.')).toBe(18)
    expect(count(portalCodes, 'CD-MA3.')).toBe(7)
  })
})

describe('phonological awareness — the reason this mattered', () => {
  // Georgia Pre-K requires at least one phonological awareness activity every
  // day, and a specialist scores it. On the 2013 edition a Pre-K teacher had a
  // single indicator at her age band to cover five days.
  const cll7 = (codes: Set<string>) => [...codes].filter((c) => c.startsWith('CLL7.'))

  it('went from 3 indicators to 16', () => {
    expect(cll7(legacyCodes)).toHaveLength(3)
    expect(cll7(portalCodes)).toHaveLength(16)
  })

  it('gives a Pre-K teacher more than one option at her own age band', () => {
    const prekOnly = (codes: Set<string>) =>
      cll7(codes).filter((c) => parseFullCode(c)?.ageBand === 4)
    expect(prekOnly(legacyCodes)).toHaveLength(1)
    expect(prekOnly(portalCodes).length).toBeGreaterThanOrEqual(5)
  })
})

describe('the duplicate DECAL publishes', () => {
  it('is allowed through only by an explicit, documented decision', () => {
    const known = KNOWN_DUPLICATES.find((d) => d.version === CURRENT_EDITION)
    expect(known?.fullCode).toBe('CLL1.0b')
    expect(known?.keepSourceId).toBe(237)
    expect(known?.why).toMatch(/DECAL/)
  })

  it('leaves exactly one CLL1.0b in the artifact', () => {
    const rows = portal.indicators.filter((i) => i.fullCode === 'CLL1.0b')
    expect(rows).toHaveLength(1)
    expect(rows[0]?.indicatorText).toBe('Responds to simple directions')
  })

  it('allows nothing else through', () => {
    expect(KNOWN_DUPLICATES).toHaveLength(1)
  })
})

describe('both artifacts are internally sound', () => {
  it.each([
    ['portal', portal],
    ['2013', legacy],
  ])('%s: every code parses and every row has wording', (_label, artifact) => {
    const bad = artifact.indicators.filter(
      (i) => !parseFullCode(i.fullCode) || i.indicatorText.trim() === ''
    )
    expect(bad).toEqual([])
  })

  it.each([
    ['portal', portal],
    ['2013', legacy],
  ])('%s: no duplicate codes survive', (_label, artifact) => {
    expect(new Set(artifact.indicators.map((i) => i.fullCode)).size).toBe(artifact.total)
  })
})
