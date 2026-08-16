/**
 * THE MOST IMPORTANT TEST FILE IN THE REPO.
 *
 * Multi-tenant leaks are the one bug class that kills this company, so the
 * security boundary is tested before the features that sit on it.
 *
 * Phase 0 does not ship until this file is complete and green.
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Client } from 'pg'
import {
  asUser,
  connect,
  DATABASE_URL,
  forgedRead,
  resetSchema,
  seed,
  type Fixture,
} from './harness'

const hasDatabase = DATABASE_URL.length > 0

if (!hasDatabase) {
  console.warn(
    '\n  DATABASE_URL is not set — RLS tests were SKIPPED.\n' +
      '  These are the tests that prove tenant isolation. A green run without\n' +
      '  them means nothing. Start a throwaway Postgres and set DATABASE_URL.\n'
  )
}

describe.skipIf(!hasDatabase)('row level security', () => {
  let client: Client
  let f: Fixture

  beforeAll(async () => {
    client = await connect()
    await resetSchema(client)
    f = await seed(client)
  }, 60_000)

  afterAll(async () => {
    await client?.end()
  })

  // -- The four tests every table gets ---------------------------------------

  const TENANT_TABLES = ['center', 'classroom', 'child', 'enrollment', 'staff'] as const

  describe.each(TENANT_TABLES)('%s', (table) => {
    const centerColumn = table === 'center' ? 'id' : 'center_id'

    it('a user in Center A can read their own center rows', async () => {
      const { rows, error } = await asUser<{ count: string }>(
        client,
        f.directorA,
        `select count(*)::text as count from ${table} where ${centerColumn} = $1`,
        [f.centerA]
      )
      expect(error).toBeNull()
      expect(Number(rows[0]?.count ?? '0')).toBeGreaterThan(0)
    })

    it("a user in Center A cannot read Center B's rows", async () => {
      const { rows, error } = await asUser<{ count: string }>(
        client,
        f.directorA,
        `select count(*)::text as count from ${table} where ${centerColumn} = $1`,
        [f.centerB]
      )
      expect(error).toBeNull()
      expect(Number(rows[0]?.count ?? '0')).toBe(0)
    })

    it('anonymous cannot read anything', async () => {
      const { rows, error } = await asUser<{ count: string }>(
        client,
        null,
        `select count(*)::text as count from ${table}`
      )
      // Either the policy returns nothing or the grant is refused outright.
      // Both are acceptable; a row is not.
      if (!error) {
        expect(Number(rows[0]?.count ?? '0')).toBe(0)
      }
    })
  })

  it("a user in Center A cannot write to Center B's rows", async () => {
    const { error } = await asUser(
      client,
      f.directorA,
      `update classroom set name = 'hijacked' where center_id = $1`,
      [f.centerB]
    )
    // The update is silently scoped to nothing by the USING clause; prove it
    // by reading back as someone who can see Center B.
    expect(error).toBeNull()

    const { rows } = await asUser<{ name: string }>(
      client,
      f.teacherB1,
      `select name from classroom where center_id = $1`,
      [f.centerB]
    )
    expect(rows.every((r) => r.name !== 'hijacked')).toBe(true)
  })

  it('a user in Center A cannot insert a row into Center B', async () => {
    const { error } = await asUser(
      client,
      f.directorA,
      `insert into classroom (center_id, name, age_band) values ($1, 'smuggled', 3)`,
      [f.centerB]
    )
    expect(error).toMatch(/row-level security/i)
  })

  // -- Classroom scoping within a single center ------------------------------

  it('a teacher in Classroom 1 cannot read a child in Classroom 2 of the same center', async () => {
    const { rows, error } = await asUser<{ id: string }>(
      client,
      f.teacherA1,
      `select id from child where id = $1`,
      [f.childA2]
    )
    expect(error).toBeNull()
    expect(rows).toHaveLength(0)
  })

  it('a teacher can read a child in her own room', async () => {
    const { rows, error } = await asUser<{ id: string }>(
      client,
      f.teacherA1,
      `select id from child where id = $1`,
      [f.childA1]
    )
    expect(error).toBeNull()
    expect(rows).toHaveLength(1)
  })

  it('a director sees every child in her center, including rooms she does not teach', async () => {
    const { rows, error } = await asUser<{ id: string }>(
      client,
      f.directorA,
      `select id from child where center_id = $1`,
      [f.centerA]
    )
    expect(error).toBeNull()
    expect(rows.length).toBeGreaterThanOrEqual(2)
  })

  // -- The handoff grace window ----------------------------------------------

  it('previous_teacher_retains_access_during_handoff', async () => {
    // Dee left this teacher's room nine days ago. The promotion flow assigned
    // her a passport sign-off; without this window the app would lock her out
    // of a task it gave her.
    const { rows, error } = await asUser<{ id: string }>(
      client,
      f.teacherA1,
      `select id from child where id = $1`,
      [f.childA1Departed]
    )
    expect(error).toBeNull()
    expect(rows).toHaveLength(1)
  })

  it('the handoff window closes after 14 days', async () => {
    const { rows, error } = await asUser<{ id: string }>(
      client,
      f.teacherA1,
      `select id from child where id = $1`,
      [f.childA1LongGone]
    )
    expect(error).toBeNull()
    expect(rows).toHaveLength(0)
  })

  // -- The forged-request test -----------------------------------------------
  // The UI proves nothing. This hits the data layer directly with a filter the
  // caller chose, which is what an attacker actually does.

  it('a forged center_id filter returns nothing across every tenant table', async () => {
    for (const table of TENANT_TABLES) {
      if (table === 'center') continue // center has no center_id column
      const leaked = await forgedRead(client, f.teacherA1, table, f.centerB)
      expect(leaked, `${table} leaked rows to a forged center_id`).toBe(0)
    }
  })

  // -- Role limits ------------------------------------------------------------

  it('a plain teacher cannot edit a child, even one in her own room', async () => {
    const { error } = await asUser(
      client,
      f.teacherA1,
      `update child set first_name = 'Renamed' where id = $1`,
      [f.childA1]
    )
    expect(error).toBeNull()

    const { rows } = await asUser<{ first_name: string }>(
      client,
      f.directorA,
      `select first_name from child where id = $1`,
      [f.childA1]
    )
    expect(rows[0]?.first_name).toBe('Maya')
  })

  it('a teacher cannot add herself to another center', async () => {
    const { error } = await asUser(
      client,
      f.teacherA1,
      `insert into staff (center_id, user_id, role) values ($1, $2, 'director')`,
      [f.centerB, f.teacherA1]
    )
    expect(error).toMatch(/row-level security/i)
  })

  // -- Audit log is append-only ----------------------------------------------

  it('nobody can update or delete an audit row', async () => {
    await asUser(
      client,
      f.directorA,
      `insert into audit_log (center_id, actor_id, action, entity_type, entity_id)
       values ($1, $2, 'view', 'child', $3)`,
      [f.centerA, f.directorA, f.childA1]
    )

    // No UPDATE or DELETE policy exists on audit_log, so Postgres finds no
    // rows to act on rather than raising. Zero rows affected IS the security
    // property, and it is what production behaves like: Supabase grants table
    // privileges broadly and relies on RLS as the only gate.
    const update = await asUser(client, f.directorA, `update audit_log set action = 'create'`)
    expect(update.error).toBeNull()
    expect(update.rowCount).toBe(0)

    const remove = await asUser(client, f.directorA, `delete from audit_log`)
    expect(remove.rowCount).toBe(0)
  })

  // -- GELDS reference data ---------------------------------------------------

  // The full_code shape is expressed twice — as FULL_CODE_PATTERN in
  // lib/gelds/constants.ts and as a CHECK constraint in migration 0003. These
  // tests run against the constraint as the table owner (so RLS is not what is
  // being measured) and must stay in step with tests/unit/gelds-code.test.ts.
  describe('the database enforces the same code shape the app does', () => {
    const insert = (fullCode: string, domain = 'PDM', subdomain: string | null = null) =>
      client.query(
        `insert into gelds_indicator
           (gelds_version, domain_code, subdomain_code, standard_number, age_band, full_code, indicator_text)
         values ('test', $1, $2, 6, 3, $3, 'x')`,
        [domain, subdomain, fullCode]
      )

    it('accepts a well-formed plain-domain code', async () => {
      await expect(insert('PDM6.3b')).resolves.toBeDefined()
    })

    it('accepts a well-formed CD code', async () => {
      await expect(insert('CD-MA6.3b', 'CD', 'MA')).resolves.toBeDefined()
    })

    it.each(['PDM0.3b', 'PDM06.3b', 'pdm6.3b', 'PDM6.5b', 'PDM6.3g', 'CD6.3b'])(
      'rejects %s',
      async (badCode) => {
        await expect(insert(badCode)).rejects.toThrow(/full_code_shape|subdomain_only_on_cd/)
      }
    )

    it('rejects a subdomain on a non-CD domain', async () => {
      await expect(insert('PDM6.3b', 'PDM', 'MA')).rejects.toThrow(/subdomain_only_on_cd/)
    })

    it('rejects a CD row with no subdomain', async () => {
      await expect(insert('CD-MA6.3b', 'CD', null)).rejects.toThrow(/subdomain_only_on_cd/)
    })
  })

  it('no authenticated user can write to the GELDS tables', async () => {
    const { error } = await asUser(
      client,
      f.directorA,
      `insert into gelds_indicator
         (gelds_version, domain_code, standard_number, age_band, full_code, indicator_text)
       values ('2013-rev-2024', 'PDM', 6, 3, 'PDM6.3b', 'made up')`
    )
    expect(error).toMatch(/policy|permission|denied/i)
  })
})
