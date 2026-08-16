/**
 * Where the GELDS standards come from. Ticket T-0.6.
 *
 * There is more than one edition in circulation at once, so `gelds_version` is
 * not decoration — see docs/GELDS-EDITIONS.md.
 *
 * Standards content © Georgia Department of Early Care and Learning.
 * Reproduced here under a permission request that is still outstanding —
 * see docs/OPEN-ITEMS.md §1. Parsed data stays in this repo and does not reach
 * a deploy until that lands.
 */

import type { AgeBand } from '@/lib/gelds/constants'

export interface PdfSource {
  ageBand: AgeBand
  /** Filename under supabase/gelds/source/ */
  file: string
  url: string
}

/**
 * The 2013 age-band PDFs. Footed "©Bright from the Start 2013".
 *
 * Kept, not deleted: a plan printed against this edition must keep showing what
 * it showed, and rows carry the version they were written against.
 */
export const GELDS_PDF_SOURCES: readonly PdfSource[] = [
  {
    ageBand: 0,
    file: '0-12_Indicators.pdf',
    url: 'https://gelds.decal.ga.gov/pdf/indicators/0-12_Indicators.pdf',
  },
  {
    ageBand: 1,
    file: '12-24_Indicators.pdf',
    url: 'https://gelds.decal.ga.gov/pdf/indicators/12-24_Indicators.pdf',
  },
  {
    ageBand: 2,
    file: '24-36_Indicators.pdf',
    url: 'https://gelds.decal.ga.gov/pdf/indicators/24-36_Indicators.pdf',
  },
  {
    ageBand: 3,
    file: '36-48_Indicators.pdf',
    url: 'https://gelds.decal.ga.gov/pdf/indicators/36-48_Indicators.pdf',
  },
  {
    ageBand: 4,
    file: '48-60_Indicators.pdf',
    url: 'https://gelds.decal.ga.gov/pdf/indicators/48-60_Indicators.pdf',
  },
]

export type EditionId = '2013' | 'portal-2026-08-16'

export interface Edition {
  id: EditionId
  kind: 'pdf' | 'portal'
  label: string
  note: string
}

export const EDITIONS: Record<EditionId, Edition> = {
  '2013': {
    id: '2013',
    kind: 'pdf',
    label: 'GELDS 2013 (age-band PDFs)',
    note: 'The original edition. Superseded by the portal, kept so historical plans still render.',
  },
  'portal-2026-08-16': {
    id: 'portal-2026-08-16',
    kind: 'portal',
    label: 'GELDS live portal, snapshot 2026-08-16',
    note:
      'The portal displays "GELDS Update in Progress", so this is a dated snapshot rather than ' +
      'a named edition. A 2026 Pre-K revision is publishing separately, CLL first, for FY27.',
  },
}

/** What new plans are written against. */
export const CURRENT_EDITION: EditionId = 'portal-2026-08-16'

/** Kept for the older artifact filename; do not use for new rows. */
export const LEGACY_EDITION: EditionId = '2013'

/** Shown when the importer drops a record under a documented duplicate decision. */
export const KNOWN_DUPLICATE_NOTE =
  'documented duplicate decision, see supabase/gelds/validate.ts KNOWN_DUPLICATES'
