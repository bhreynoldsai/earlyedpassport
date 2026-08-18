import { describe, expect, it } from 'vitest'
import { isValidFullCode } from '@/lib/framework/code'
import { AGE_BAND_VALUES, PATHWAY_CODES } from '@/lib/framework/constants'
import { MILESTONE_GROUPS, SKILL_MARKERS, seedFullCode } from '@/lib/framework/seed-data'

/**
 * The starter content is hand-written, not generated — these tests exist so
 * a typo (a marker pointing at a milestone group that doesn't exist, a
 * duplicate code, an out-of-range age band) is caught before
 * `pnpm framework:load` ever tries to write it.
 */

describe('milestone groups', () => {
  it('every pathway has at least one milestone group', () => {
    for (const code of PATHWAY_CODES) {
      expect(MILESTONE_GROUPS.some((g) => g.pathwayCode === code)).toBe(true)
    }
  })

  it('group numbers are unique within a pathway', () => {
    const seen = new Set<string>()
    for (const g of MILESTONE_GROUPS) {
      const key = `${g.pathwayCode}-${g.groupNumber}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
    }
  })
})

describe('skill markers', () => {
  const groupKeys = new Set(MILESTONE_GROUPS.map((g) => `${g.pathwayCode}-${g.groupNumber}`))

  it('every skill marker points at a milestone group that exists', () => {
    for (const m of SKILL_MARKERS) {
      expect(groupKeys.has(`${m.pathwayCode}-${m.groupNumber}`)).toBe(true)
    }
  })

  it('every age band is one of the five real bands', () => {
    for (const m of SKILL_MARKERS) {
      expect(AGE_BAND_VALUES).toContain(m.ageBand)
    }
  })

  it('every marker produces a valid full code', () => {
    for (const m of SKILL_MARKERS) {
      expect(isValidFullCode(seedFullCode(m))).toBe(true)
    }
  })

  it('full codes are unique', () => {
    const seen = new Set<string>()
    for (const m of SKILL_MARKERS) {
      const code = seedFullCode(m)
      expect(seen.has(code)).toBe(false)
      seen.add(code)
    }
  })

  it('every pathway has real content, not just a stub', () => {
    for (const code of PATHWAY_CODES) {
      expect(SKILL_MARKERS.filter((m) => m.pathwayCode === code).length).toBeGreaterThanOrEqual(5)
    }
  })

  it('no skill text is empty', () => {
    for (const m of SKILL_MARKERS) {
      expect(m.skillText.trim().length).toBeGreaterThan(0)
    }
  })

  it('never mentions GELDS or DECAL — this content is ours', () => {
    const all = JSON.stringify(SKILL_MARKERS) + JSON.stringify(MILESTONE_GROUPS)
    expect(all).not.toMatch(/GELDS/i)
    expect(all).not.toMatch(/DECAL/i)
  })
})
