/**
 * Demo seed runner. Ticket T-0.11.
 *
 *   pnpm seed
 *
 * Fills an EMPTY Supabase project with one invented center so the app has
 * something to show. Idempotent: every row carries a fixed `5eed…` id, so
 * running it twice updates rather than duplicates.
 *
 * ---------------------------------------------------------------------------
 * THIS SCRIPT BYPASSES ROW LEVEL SECURITY.
 *
 * It runs as the service role, because it has to: it writes rows for four
 * different users across a center that does not exist yet. That makes it one of
 * exactly two things allowed to hold the service key (the other is the GELDS
 * importer), and it is why the guard below exists.
 *
 * NEVER RUN THIS AGAINST A DATABASE HOLDING REAL CHILDREN. The guard refuses
 * when it finds a center that is not the demo center, which is the situation
 * that means "you pointed this at a real deployment".
 * ---------------------------------------------------------------------------
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../lib/supabase/database.types'
import {
  buildSeed,
  CLASSROOMS,
  DEMO_CENTER_ID,
  DEMO_ORG_ID,
  DEMO_PASSWORD,
  STAFF,
  type ClassroomKey,
} from './data'

/**
 * Typed against the generated schema, so a mistyped column name fails at
 * compile time. This script is awkward to test — it needs a live project — so
 * the compiler is doing most of the checking that tests would otherwise.
 */
type Db = SupabaseClient<Database>

function requireEnv(name: string, alt?: string): string {
  const value = process.env[name] ?? (alt ? process.env[alt] : undefined)
  if (!value) {
    throw new Error(`${name} is not set${alt ? ` (${alt} also accepted)` : ''}. See .env.example.`)
  }
  return value
}

/** Fail on a Supabase error rather than continuing with half a center. */
function must<T>(result: { data: T; error: { message: string } | null }, what: string): T {
  if (result.error) throw new Error(`${what}: ${result.error.message}`)
  return result.data
}

// ---------------------------------------------------------------------------
// Guard
// ---------------------------------------------------------------------------

/**
 * Refuses to touch a database that holds anything but demo data.
 *
 * This is not about tidiness. The spec's rule is "no real child data in
 * staging, ever", and its mirror image is that seed data must never land on top
 * of real children. A center row we did not create means we are pointed
 * somewhere we should not be, and the only safe move is to stop.
 */
async function assertSafeTarget(db: Db): Promise<void> {
  const { data, error } = await db
    .from('center')
    .select('id, name')
    .neq('id', DEMO_CENTER_ID)
    .limit(5)

  if (error) {
    // An empty project has the tables but no rows; a missing table means the
    // migrations have not been applied, which is a different, clearer problem.
    if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
      throw new Error(
        'The schema is not applied yet. Push the migrations first — see docs/SUPABASE-SETUP.md.'
      )
    }
    throw new Error(`Could not inspect the target database: ${error.message}`)
  }

  if (data && data.length > 0) {
    const names = data.map((c: { name: string }) => c.name).join(', ')
    throw new Error(
      `REFUSING TO SEED.\n\n` +
        `This database already contains ${data.length} center(s) that the seed did not create: ${names}.\n` +
        `That means it is a real deployment, not a scratch one.\n\n` +
        `No rows were written. If this really is a throwaway project, delete those rows by hand first.`
    )
  }
}

// ---------------------------------------------------------------------------
// Auth users
// ---------------------------------------------------------------------------

/**
 * Creates the sign-in account, or finds it if a previous run already did.
 *
 * Supabase assigns the user id, so we cannot pin it the way we pin every other
 * id here — the account is looked up by email instead, and everything
 * downstream hangs off whatever id comes back.
 */
async function ensureAuthUser(db: Db, email: string, fullName: string): Promise<string> {
  const created = await db.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true, // No inbox exists at example.com, so skip confirmation.
    user_metadata: { full_name: fullName },
  })

  if (!created.error && created.data.user) return created.data.user.id

  const alreadyExists =
    created.error &&
    (created.error.message.toLowerCase().includes('already') || created.error.status === 422)
  if (!alreadyExists) {
    throw new Error(`Could not create ${email}: ${created.error?.message ?? 'unknown error'}`)
  }

  // Already there from an earlier run: find it and reuse it.
  const listed = await db.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (listed.error) throw new Error(`Could not list users: ${listed.error.message}`)

  const found = listed.data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
  if (!found) {
    throw new Error(
      `${email} reported as already registered but was not found in the first 200 users.`
    )
  }
  return found.id
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY')

  const db: Db = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  console.log(`Seeding ${url}`)
  await assertSafeTarget(db)

  const seed = buildSeed(new Date())

  // -- accounts first: everything else records who created it ----------------
  const userIds = new Map<string, string>()
  for (const person of STAFF) {
    const userId = await ensureAuthUser(db, person.email, person.fullName)
    userIds.set(person.email, userId)
  }

  /** Every staff email was just created or found, so a miss is a bug, not a case. */
  const accountId = (email: string): string => {
    const found = userIds.get(email)
    if (!found) throw new Error(`No account was created for ${email}.`)
    return found
  }

  const director = STAFF.find((s) => s.role === 'director')
  if (!director) throw new Error('The demo center has no director.')
  const createdBy = accountId(director.email)

  must(
    await db.from('app_user').upsert(
      STAFF.map((person) => ({
        id: accountId(person.email),
        email: person.email,
        full_name: person.fullName,
      })),
      { onConflict: 'id' }
    ),
    'app_user'
  )
  console.log(`  ${STAFF.length} accounts`)

  // -- the center ------------------------------------------------------------
  must(
    await db
      .from('organization')
      .upsert({ id: DEMO_ORG_ID, name: 'Peachtree Early Learning', created_by: createdBy }),
    'organization'
  )

  must(
    await db.from('center').upsert({
      id: DEMO_CENTER_ID,
      organization_id: DEMO_ORG_ID,
      name: 'Peachtree Early Learning — Decatur',
      // Not a real DECAL licence number, and shaped so nobody mistakes it.
      decal_license_no: 'DEMO-0000000',
      time_zone: 'America/New_York',
      created_by: createdBy,
    }),
    'center'
  )
  console.log('  1 center')

  must(
    await db.from('classroom').upsert(
      CLASSROOMS.map((room) => ({
        id: room.id,
        center_id: DEMO_CENTER_ID,
        name: room.name,
        age_band: room.ageBand,
        capacity: room.capacity,
        is_ga_prek: room.isGaPreK,
        created_by: createdBy,
      }))
    ),
    'classroom'
  )
  console.log(`  ${CLASSROOMS.length} classrooms`)

  // -- staff -----------------------------------------------------------------
  const roomId = (key: ClassroomKey): string => {
    const room = CLASSROOMS.find((c) => c.key === key)
    // A typo in a staff member's room list would otherwise silently produce an
    // empty assignment, and she would sign in to an empty roster.
    if (!room) throw new Error(`Unknown classroom key: ${key}`)
    return room.id
  }

  must(
    await db.from('staff').upsert(
      STAFF.map((person) => ({
        id: person.id,
        center_id: DEMO_CENTER_ID,
        user_id: accountId(person.email),
        role: person.role,
        classroom_ids: person.classrooms.map(roomId),
        created_by: createdBy,
      }))
    ),
    'staff'
  )
  console.log(`  ${STAFF.length} staff assignments`)

  // -- children and their enrollment history ---------------------------------
  must(
    await db.from('child').upsert(
      seed.children.map((child) => ({
        id: child.id,
        center_id: DEMO_CENTER_ID,
        first_name: child.firstName,
        last_name: child.lastName,
        preferred_name: child.preferredName,
        name_pronunciation: child.namePronunciation,
        date_of_birth: child.dateOfBirth,
        home_language: child.homeLanguage,
        photo_consent: child.photoConsent,
        created_by: createdBy,
      }))
    ),
    'child'
  )
  console.log(`  ${seed.children.length} children`)

  must(
    await db.from('enrollment').upsert(
      seed.enrollments.map((e) => ({
        id: e.id,
        center_id: DEMO_CENTER_ID,
        child_id: e.childId,
        classroom_id: e.classroomId,
        started_on: e.startedOn,
        ended_on: e.endedOn,
        ended_reason: e.endedReason,
        program_start: e.programStart,
        created_by: createdBy,
      }))
    ),
    'enrollment'
  )
  const open = seed.enrollments.filter((e) => e.endedOn === null).length
  console.log(`  ${seed.enrollments.length} enrollments (${open} current)`)

  // -- what you can now do with it -------------------------------------------
  console.log('\nSign in with any of these — same password for all four:\n')
  for (const person of STAFF) {
    console.log(`  ${person.email.padEnd(30)} ${person.role.padEnd(13)} ${person.fullName}`)
  }
  console.log(`\n  password: ${DEMO_PASSWORD}\n`)
  console.log('Worth trying: sign in as teacher.sunshine@example.com. Mateo Rios moved up to')
  console.log('Explorers nine days ago and she should still see him — that is the 14-day')
  console.log('handoff window. He disappears from her list once it closes.\n')

  console.log('NOT SEEDED: lesson plans. Those tables arrive with T-1.1, and inventing a')
  console.log('schema ahead of its ticket is how the schema ends up wrong.\n')
}

main().catch((error: unknown) => {
  console.error(`\n${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
})
