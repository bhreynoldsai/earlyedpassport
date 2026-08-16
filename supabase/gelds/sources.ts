/**
 * Where the GELDS standards come from. Ticket T-0.6.
 *
 * Standards content © Georgia Department of Early Care and Learning.
 * Reproduced here under a permission request that is still outstanding —
 * see docs/OPEN-ITEMS.md §1. The parsed JSON stays in this repo and does not
 * reach a deploy until that lands.
 */

import type { AgeBand } from '@/lib/gelds/constants'

export interface GeldsSource {
  ageBand: AgeBand
  /** Filename under supabase/gelds/source/ */
  file: string
  url: string
}

/**
 * DECAL publishes one indicator PDF per age band. These are the canonical
 * source; the Quick Guide is a summary and is not authoritative for indicator
 * text.
 */
export const GELDS_SOURCES: readonly GeldsSource[] = [
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

/** The version tag stamped onto every row and every attached code snapshot. */
export const GELDS_VERSION = '2013-rev-2024'
