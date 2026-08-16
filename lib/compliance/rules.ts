/**
 * Compliance deadline rules, one entry per doc_type.
 *
 * Deadlines are DIFFERENT per form. Do not write one countdown — that is how
 * the app fires false alarms. The number 30 and the number 90 appear here and
 * nowhere else in the codebase.
 *
 * HARD RULE: enrollment is NEVER blocked by any of this. DECAL prohibits
 * requiring either form as a condition of enrollment, and a valid appointment
 * card keeps a child enrolled past either deadline. Everything in this file is
 * display and reminder only. There is no code path from here to a block.
 */

import { addDays, addMonths, isBefore } from 'date-fns'

export type ComplianceStatus = 'missing' | 'appointment_card' | 'on_file' | 'expired'

/** A fifth DISPLAY case, Form 3300 only. Not a stored status. */
export type ComplianceDisplayState = ComplianceStatus | 'screening_too_old'

export interface ComplianceDocInput {
  status: ComplianceStatus
  /** When the screenings were performed. Form 3300 only. */
  screenedOn?: Date | null
  programStart: Date
}

export interface ComplianceRule {
  docType: string
  /** Human label lives in lib/copy.ts; this is the internal name. */
  dueDays: number
  /**
   * Optional extra check beyond "is it here yet". Returns a display state that
   * overrides the stored status, or null to keep the stored status.
   */
  validate?: (input: ComplianceDocInput) => ComplianceDisplayState | null
}

export const COMPLIANCE_RULES: Record<string, ComplianceRule> = {
  /**
   * Certificate of Immunization.
   * On file within 30 calendar days of program start.
   * Must be replaced within 30 days after expiration.
   */
  form_3231: {
    docType: 'form_3231',
    dueDays: 30,
  },

  /**
   * Vision, Hearing, Dental & Nutrition Screening. Required for Pre-K.
   * On file within 90 calendar days of program start, AND the screenings must
   * have been performed within the 12 months BEFORE program start. A form that
   * is on file but screened too long ago does not count.
   */
  form_3300: {
    docType: 'form_3300',
    dueDays: 90,
    validate: ({ status, screenedOn, programStart }) => {
      if (status !== 'on_file') return null
      if (!screenedOn) return null
      const earliestAcceptable = addMonths(programStart, -12)
      return isBefore(screenedOn, earliestAcceptable) ? 'screening_too_old' : null
    },
  },
}

export function getRule(docType: string): ComplianceRule {
  const rule = COMPLIANCE_RULES[docType]
  if (!rule) {
    throw new Error(`No compliance rule for doc type: ${docType}`)
  }
  return rule
}

/** Computed at enrollment. Never inline the day count at a call site. */
export function computeDueOn(docType: string, programStart: Date): Date {
  return addDays(programStart, getRule(docType).dueDays)
}

/**
 * The state to show on a ComplianceStatusPill. Every one of these is amber or
 * neutral — never red, and none of them blocks anything.
 */
export function displayStateFor(
  docType: string,
  input: ComplianceDocInput
): ComplianceDisplayState {
  const rule = getRule(docType)
  return rule.validate?.(input) ?? input.status
}
