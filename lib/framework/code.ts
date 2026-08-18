/**
 * Compass skill-marker code parsing and formatting.
 *
 * `full_code` is computed here and by the seed script. It is NEVER
 * hand-entered and never typed by a teacher — same rule GELDS codes lived
 * under, carried forward.
 */

import { PATHWAY_CODES, SKILL_MARKER_CODE_PATTERN, type PathwayCode } from './constants'

export interface ParsedCode {
  pathwayCode: PathwayCode
  groupNumber: number
  markerNumber: number
  fullCode: string
}

/**
 * Parse a Compass skill-marker code. Returns null rather than throwing so
 * callers can decide how loud to be — a seed script fails the whole run,
 * the UI just ignores an unrecognized code.
 */
export function parseFullCode(input: string): ParsedCode | null {
  const match = SKILL_MARKER_CODE_PATTERN.exec(input)
  if (!match) return null

  const [, pathwayCode, groupNumber, markerNumber] = match
  if (!pathwayCode || !groupNumber || !markerNumber) return null

  return {
    pathwayCode: pathwayCode as PathwayCode,
    groupNumber: Number(groupNumber),
    markerNumber: Number(markerNumber),
    fullCode: input,
  }
}

export function isValidFullCode(input: string): boolean {
  return parseFullCode(input) !== null
}

/**
 * Build a full code from its parts. The single place a code string is
 * created. Throws on impossible input — a bad code must never reach a
 * printed plan.
 */
export function formatFullCode(parts: {
  pathwayCode: PathwayCode
  groupNumber: number
  markerNumber: number
}): string {
  const { pathwayCode, groupNumber, markerNumber } = parts

  if (!PATHWAY_CODES.includes(pathwayCode)) {
    throw new Error(`Unknown pathway: ${String(pathwayCode)}`)
  }
  if (!Number.isInteger(groupNumber) || groupNumber < 1 || groupNumber > 99) {
    throw new Error(`Milestone group number out of range: ${groupNumber}`)
  }
  if (!Number.isInteger(markerNumber) || markerNumber < 1 || markerNumber > 99) {
    throw new Error(`Skill marker number out of range: ${markerNumber}`)
  }

  const code = `${pathwayCode}-${groupNumber}.${markerNumber}`

  // Belt and braces: what we build must satisfy what we validate.
  if (!SKILL_MARKER_CODE_PATTERN.test(code)) {
    throw new Error(`Built an invalid Compass code: ${code}`)
  }
  return code
}

/** Which of the six Pathways does this code count toward? */
export function coveragePathwayOf(fullCode: string): PathwayCode | null {
  return parseFullCode(fullCode)?.pathwayCode ?? null
}

/** The set of Pathways a week's worth of attached codes covers. */
export function coveredPathways(fullCodes: readonly string[]): Set<PathwayCode> {
  const covered = new Set<PathwayCode>()
  for (const code of fullCodes) {
    const pathway = coveragePathwayOf(code)
    if (pathway) covered.add(pathway)
  }
  return covered
}
