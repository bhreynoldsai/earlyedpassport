import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Client } from 'pg'
import { connect, DATABASE_URL, resetSchema } from './harness'

/**
 * Table privileges, checked against the policies they are supposed to pair with.
 *
 * Row level security decides which ROWS. A grant decides whether the role may
 * touch the TABLE at all. The two failure modes look nothing alike:
 *
 *   policy without grant  -> "permission denied for table x". Loud, and caught
 *                            the first time anyone opens the screen.
 *   grant without policy  -> default deny. Silent, and indistinguishable from
 *                            working correctly until a policy is added later
 *                            and quietly opens more than its author intended.
 *
 * The second is the dangerous one, so this file asserts EQUALITY rather than
 * sufficiency: the verbs granted to `authenticated` on a table must be exactly
 * the verbs that have a policy naming `authenticated`. Adding a table without a
 * grant fails here, and so does adding a grant without a policy.
 */

const hasDatabase = DATABASE_URL.length > 0

/** Verbs a policy can carry. `ALL` is expanded before comparison. */
const ALL_VERBS = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] as const

interface GrantRow {
  table_name: string
  privilege_type: string
}
interface PolicyRow {
  tablename: string
  cmd: string
  roles: string[]
}

function collect(map: Map<string, Set<string>>, key: string, value: string): void {
  const existing = map.get(key)
  if (existing) existing.add(value)
  else map.set(key, new Set([value]))
}

describe.skipIf(!hasDatabase)('table privileges match the policies', () => {
  let client: Client
  let grants: Map<string, Set<string>>
  let policies: Map<string, Set<string>>
  let baseTables: string[]

  beforeAll(async () => {
    client = await connect()
    await resetSchema(client)

    const grantRows = await client.query<GrantRow>(`
      select table_name, privilege_type
      from information_schema.role_table_grants
      where grantee = 'authenticated' and table_schema = 'public'
    `)
    grants = new Map()
    for (const r of grantRows.rows) collect(grants, r.table_name, r.privilege_type)

    const policyRows = await client.query<PolicyRow>(`
      select tablename, cmd, roles::text[] as roles
      from pg_policies where schemaname = 'public'
    `)
    policies = new Map()
    for (const r of policyRows.rows) {
      if (!r.roles.includes('authenticated')) continue
      if (r.cmd === 'ALL') for (const v of ALL_VERBS) collect(policies, r.tablename, v)
      else collect(policies, r.tablename, r.cmd)
    }

    const tableRows = await client.query<{ table_name: string }>(`
      select table_name from information_schema.tables
      where table_schema = 'public' and table_type = 'BASE TABLE'
      order by table_name
    `)
    baseTables = tableRows.rows.map((r) => r.table_name)
  }, 60_000)

  afterAll(async () => {
    await client?.end()
  })

  it('finds every table (a schema that failed to build would vacuously pass)', () => {
    expect(baseTables.length).toBe(12)
  })

  it.each([
    'app_user',
    'organization',
    'center',
    'classroom',
    'child',
    'enrollment',
    'staff',
    'gelds_domain',
    'gelds_strand',
    'gelds_standard',
    'gelds_indicator',
    'audit_log',
  ])('%s grants exactly the verbs it has policies for', (table) => {
    const granted = [...(grants.get(table) ?? [])].sort()
    const policed = [...(policies.get(table) ?? [])].sort()
    expect(granted).toEqual(policed)
  })

  it('no table lets authenticated delete, because nothing hard deletes', () => {
    for (const table of baseTables) {
      expect(grants.get(table) ?? new Set()).not.toContain('DELETE')
    }
  })

  it('audit_log is append-only: insert and select, never update', () => {
    expect([...(grants.get('audit_log') ?? [])].sort()).toEqual(['INSERT', 'SELECT'])
  })

  it('the child_current_classroom view is selectable', () => {
    expect(grants.get('child_current_classroom')).toContain('SELECT')
  })

  // -- anon -------------------------------------------------------------------

  it('anon holds no table privileges at all', async () => {
    const { rows } = await client.query<{ table_name: string; privilege_type: string }>(`
      select table_name, privilege_type
      from information_schema.role_table_grants
      where grantee = 'anon' and table_schema = 'public'
    `)
    expect(rows).toEqual([])
  })

  /**
   * Migration 0004's `revoke execute ... from anon` lines do not work on their
   * own: Postgres grants EXECUTE on a new function to PUBLIC, and anon inherits
   * that. 0006 revokes from PUBLIC to make the intent real. This is the test
   * that would have caught the original no-op.
   */
  it('anon cannot execute the RLS helper functions', async () => {
    const { rows } = await client.query<{ fn: string; allowed: boolean }>(`
      select p.proname as fn,
             has_function_privilege('anon', p.oid, 'execute') as allowed
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname like 'auth\\_%'
      order by p.proname
    `)
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) {
      expect(row.allowed, `anon can execute ${row.fn}()`).toBe(false)
    }
  })

  it('authenticated can execute them, or every policy would fail closed', async () => {
    const { rows } = await client.query<{ fn: string; allowed: boolean }>(`
      select p.proname as fn,
             has_function_privilege('authenticated', p.oid, 'execute') as allowed
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname like 'auth\\_%'
    `)
    for (const row of rows) {
      expect(row.allowed, `authenticated cannot execute ${row.fn}()`).toBe(true)
    }
  })
})
