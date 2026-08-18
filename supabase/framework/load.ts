/**
 * Load The Compass into Postgres. Ticket: framework replacement.
 *
 *   pnpm framework:load
 *
 * Runs with the SERVICE ROLE, which bypasses row level security. That is
 * correct here and nowhere else: `compass_*` tables have a read policy for
 * authenticated users and no write policy at all, so this script is the
 * only writer that exists — same rule the GELDS loader lived under before
 * it. Application code never writes here, and no model ever writes here.
 *
 * Unlike the GELDS importer, there is no scrape/parse/validate pipeline:
 * the content is ours, written by hand into lib/framework/seed-data.ts, so
 * this script's only job is loading it.
 */

import '../load-env'
import { createClient } from '@supabase/supabase-js'
import { missingEnvMessage } from '../load-env'
import {
  CURRENT_FRAMEWORK_VERSION,
  PATHWAY_CODES,
  PATHWAY_NAMES,
  PATHWAY_SUMMARIES,
} from '../../lib/framework/constants'
import { MILESTONE_GROUPS, SKILL_MARKERS, seedFullCode } from '../../lib/framework/seed-data'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(missingEnvMessage(name))
  return value
}

async function main(): Promise<void> {
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRole = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

  const db = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const version = CURRENT_FRAMEWORK_VERSION
  process.stdout.write(`\nLoading The Compass as ${version}…\n`)

  // Replace the version wholesale rather than merging, same rule the GELDS
  // loader followed — a partial load is worse than no load: it leaves the
  // table looking populated while missing markers.
  for (const table of [
    'compass_skill_marker',
    'compass_milestone_group',
    'compass_pathway',
  ] as const) {
    const { error } = await db.from(table).delete().eq('framework_version', version)
    if (error) throw new Error(`Could not clear ${table} for ${version}: ${error.message}`)
  }

  const pathwayRows = PATHWAY_CODES.map((code, index) => ({
    framework_version: version,
    pathway_code: code,
    pathway_name: PATHWAY_NAMES[code],
    summary: PATHWAY_SUMMARIES[code],
    sort_order: index,
  }))
  const { error: pathwayError } = await db.from('compass_pathway').insert(pathwayRows)
  if (pathwayError) throw new Error(`Could not load pathways: ${pathwayError.message}`)
  process.stdout.write(`  ${pathwayRows.length} pathways\n`)

  const groupRows = MILESTONE_GROUPS.map((g, index) => ({
    framework_version: version,
    pathway_code: g.pathwayCode,
    group_number: g.groupNumber,
    group_name: g.groupName,
    group_description: g.groupDescription,
    sort_order: index,
  }))
  const { data: insertedGroups, error: groupError } = await db
    .from('compass_milestone_group')
    .insert(groupRows)
    .select('id, pathway_code, group_number')
  if (groupError) throw new Error(`Could not load milestone groups: ${groupError.message}`)
  process.stdout.write(`  ${groupRows.length} milestone groups\n`)

  const groupIdByKey = new Map<string, string>()
  for (const row of insertedGroups ?? []) {
    groupIdByKey.set(`${row.pathway_code}-${row.group_number}`, row.id)
  }

  const markerRows = SKILL_MARKERS.map((m) => {
    const groupId = groupIdByKey.get(`${m.pathwayCode}-${m.groupNumber}`)
    if (!groupId) {
      throw new Error(
        `Skill marker ${m.pathwayCode}-${m.groupNumber}.${m.markerNumber} has no matching milestone group.`
      )
    }
    return {
      framework_version: version,
      pathway_code: m.pathwayCode,
      milestone_group_id: groupId,
      group_number: m.groupNumber,
      marker_number: m.markerNumber,
      age_band: m.ageBand,
      full_code: seedFullCode(m),
      skill_text: m.skillText,
    }
  })
  const { error: markerError } = await db.from('compass_skill_marker').insert(markerRows)
  if (markerError) throw new Error(`Could not load skill markers: ${markerError.message}`)
  process.stdout.write(`  ${markerRows.length} skill markers\n`)

  process.stdout.write('\nDone.\n')
}

main().catch((error: unknown) => {
  process.stderr.write(`\n${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
