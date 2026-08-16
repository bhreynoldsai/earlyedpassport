/**
 * Load validated indicators into Postgres. Ticket T-0.6, step 4.
 *
 * Runs with the SERVICE ROLE, which bypasses row level security. That is
 * correct here and nowhere else: `gelds_*` tables have a read policy for
 * authenticated users and no write policy at all, so this script is the only
 * writer that exists. Application code never writes here, and no model ever
 * writes here.
 *
 * Only reachable from import.ts, and only after every hard gate has passed.
 */

import { createClient } from '@supabase/supabase-js'
import type { RawIndicator } from './parse'

const CHUNK = 200

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `${name} is not set. The loader needs a service role key; it is server-only and must never appear in a NEXT_PUBLIC_ variable.`
    )
  }
  return value
}

export async function loadIndicators(
  indicators: readonly RawIndicator[],
  geldsVersion: string
): Promise<void> {
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRole = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

  const db = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  process.stdout.write(`\nLoading ${indicators.length} indicators as ${geldsVersion}…\n`)

  // Replace the version wholesale rather than merging. A partial load is worse
  // than no load: it leaves the table looking populated while missing codes.
  const { error: clearError } = await db
    .from('gelds_indicator')
    .delete()
    .eq('gelds_version', geldsVersion)
  if (clearError) throw new Error(`Could not clear ${geldsVersion}: ${clearError.message}`)

  for (let i = 0; i < indicators.length; i += CHUNK) {
    const batch = indicators.slice(i, i + CHUNK).map((row) => ({
      gelds_version: row.geldsVersion,
      domain_code: row.domainCode,
      subdomain_code: row.subdomainCode,
      standard_number: row.standardNumber,
      age_band: row.ageBand,
      indicator_letter: row.indicatorLetter,
      full_code: row.fullCode,
      indicator_text: row.indicatorText,
      // Our own 6th-grade paraphrase. Deliberately null on first load: it is a
      // content task, not an engineering one, and the chooser falls back to
      // indicator_text until a human writes it.
      plain_text: null,
    }))

    const { error } = await db.from('gelds_indicator').insert(batch)
    if (error) {
      throw new Error(
        `Insert failed at row ${i}: ${error.message}\n` +
          'Nothing further was loaded. Fix the cause and re-run — the script is idempotent.'
      )
    }
    process.stdout.write(`  ${Math.min(i + CHUNK, indicators.length)}/${indicators.length}\n`)
  }

  const { count, error: countError } = await db
    .from('gelds_indicator')
    .select('*', { count: 'exact', head: true })
    .eq('gelds_version', geldsVersion)
  if (countError) throw new Error(`Could not verify the load: ${countError.message}`)

  if (count !== indicators.length) {
    throw new Error(
      `Loaded ${count} rows but expected ${indicators.length}. The table is in an unknown state — re-run.`
    )
  }

  process.stdout.write(`Loaded and verified ${count} indicators.\n\n`)
}
