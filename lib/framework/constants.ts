/**
 * The Compass — our own developmental framework. Ticket: framework replacement.
 *
 * Replaces lib/gelds/*. This product no longer references Georgia's GELDS
 * standards or DECAL in any form — see docs/PROJECT-INSTRUCTIONS.md and
 * docs/FRAMEWORK.md for why. The six Pathways below are original: our own
 * names, our own groupings, our own wording. They cover the same real ground
 * early-childhood development always covers (that's not anyone's IP), but
 * nothing here is copied or paraphrased from a state standards document.
 *
 * One deliberate simplification over the old GELDS shape: age band is a real
 * column, not smuggled into the code string, and there's no separate
 * "verbatim vs. plain-language" split — we wrote everything in plain
 * language from the start, so there's only one text field per skill marker.
 */

export const PATHWAY_CODES = ['CM', 'GS', 'FW', 'BF', 'TD', 'WM'] as const
export type PathwayCode = (typeof PATHWAY_CODES)[number]

export const PATHWAY_NAMES: Record<PathwayCode, string> = {
  CM: 'Curious Mind',
  GS: 'Growing Strong',
  FW: 'Finding Words',
  BF: 'Big Feelings, Good Friends',
  TD: 'Trying & Doing',
  WM: 'Wonder & Make',
}

/**
 * What each Pathway covers, for anywhere the app needs a one-line gloss
 * (chip tooltips, the print footer, the passport). Kept here, not
 * duplicated, so the wording can only drift in one place.
 */
export const PATHWAY_SUMMARIES: Record<PathwayCode, string> = {
  CM: 'Thinking, noticing, and figuring things out.',
  GS: 'Moving, using hands and tools, and everyday self-care.',
  FW: 'Listening, talking, and falling in love with stories.',
  BF: 'Knowing yourself, calming down, and getting along.',
  TD: 'Giving things a try and sticking with what is hard.',
  WM: 'Making, pretending, and expressing ideas.',
}

/**
 * Age band mapping. Same five real-world bands used across early-childhood
 * practice generally — not anyone's proprietary breakdown. One constant,
 * used everywhere, never re-derived inline.
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
 * The one true skill-marker code pattern: `<Pathway>-<group>.<marker>`,
 * e.g. `CM-1.3`. No age band or letter suffix packed into the string — age
 * band is its own column on compass_skill_marker. Bounded numbers so a
 * seeding bug producing `CM-0.3` or `CM-100.3` is caught at import rather
 * than silently stored.
 */
export const SKILL_MARKER_CODE_PATTERN = /^(CM|GS|FW|BF|TD|WM)-([1-9]\d?)\.([1-9]\d?)$/

/**
 * The edition new plans are written against. Stamped onto every attached
 * marker the same way GELDS versions used to be — a framework revision
 * shouldn't change what a plan printed last year shows.
 */
export const CURRENT_FRAMEWORK_VERSION = '2026.1'
