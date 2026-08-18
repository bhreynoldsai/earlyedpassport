import { describe, expect, it } from 'vitest'
import {
  coveragePathwayOf,
  coveredPathways,
  formatFullCode,
  isValidFullCode,
  parseFullCode,
} from '@/lib/framework/code'
import { PATHWAY_CODES } from '@/lib/framework/constants'

describe('parseFullCode', () => {
  it('parses a well-formed code', () => {
    expect(parseFullCode('CM-1.3')).toEqual({
      pathwayCode: 'CM',
      groupNumber: 1,
      markerNumber: 3,
      fullCode: 'CM-1.3',
    })
  })

  it('accepts all six pathways', () => {
    for (const code of PATHWAY_CODES) {
      expect(parseFullCode(`${code}-1.1`)?.pathwayCode).toBe(code)
    }
  })

  it('accepts double-digit group and marker numbers', () => {
    expect(parseFullCode('WM-12.34')).toEqual({
      pathwayCode: 'WM',
      groupNumber: 12,
      markerNumber: 34,
      fullCode: 'WM-12.34',
    })
  })

  it('rejects an unknown pathway prefix', () => {
    expect(parseFullCode('XX-1.3')).toBeNull()
  })

  it('rejects a zero group number', () => {
    expect(parseFullCode('CM-0.3')).toBeNull()
  })

  it('rejects a zero marker number', () => {
    expect(parseFullCode('CM-1.0')).toBeNull()
  })

  it('rejects a three-digit group number', () => {
    expect(parseFullCode('CM-123.3')).toBeNull()
  })

  it('is uppercase only', () => {
    expect(parseFullCode('cm-1.3')).toBeNull()
  })

  it('rejects surrounding whitespace rather than trimming it', () => {
    expect(parseFullCode(' CM-1.3 ')).toBeNull()
  })

  it('rejects a code with no marker segment', () => {
    expect(parseFullCode('CM-1')).toBeNull()
  })
})

describe('formatFullCode', () => {
  it('round-trips every parseable code', () => {
    for (const code of ['CM-1.3', 'GS-2.5', 'FW-3.1', 'BF-1.5', 'TD-2.4', 'WM-3.2']) {
      const parsed = parseFullCode(code)
      expect(parsed).not.toBeNull()
      expect(
        formatFullCode({
          pathwayCode: parsed!.pathwayCode,
          groupNumber: parsed!.groupNumber,
          markerNumber: parsed!.markerNumber,
        })
      ).toBe(code)
    }
  })

  it('refuses an out-of-range group number', () => {
    expect(() => formatFullCode({ pathwayCode: 'CM', groupNumber: 0, markerNumber: 1 })).toThrow()
    expect(() => formatFullCode({ pathwayCode: 'CM', groupNumber: 100, markerNumber: 1 })).toThrow()
  })

  it('refuses an out-of-range marker number', () => {
    expect(() => formatFullCode({ pathwayCode: 'CM', groupNumber: 1, markerNumber: 0 })).toThrow()
  })
})

describe('coverage counts six pathways', () => {
  it('a full set of six pathways reports six', () => {
    const covered = coveredPathways(['CM-1.1', 'GS-1.1', 'FW-1.1', 'BF-1.1', 'TD-1.1', 'WM-1.1'])
    expect(covered.size).toBe(PATHWAY_CODES.length)
  })

  it('ignores codes it cannot parse rather than inventing a pathway', () => {
    expect(coveredPathways(['nonsense', 'CM-1.1']).size).toBe(1)
  })

  it('coveragePathwayOf agrees with parseFullCode', () => {
    expect(coveragePathwayOf('GS-2.3')).toBe('GS')
    expect(coveragePathwayOf('nonsense')).toBeNull()
  })
})

describe('isValidFullCode', () => {
  it('agrees with parseFullCode', () => {
    expect(isValidFullCode('BF-2.4')).toBe(true)
    expect(isValidFullCode('BF2.4')).toBe(false)
  })
})
