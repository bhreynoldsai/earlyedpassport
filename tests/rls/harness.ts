/**
 * RLS test harness.
 *
 * These tests run against a REAL Postgres, as a REAL non-superuser role, with
 * the same policies production runs. That matters: a superuser bypasses row
 * level security entirely, so a test that connects as one proves nothing.
 *
 * We stand up a small shim of Supabase's auth schema (auth.users, auth.uid())
 * because that is all our policies actually depend on.
 *
 * Set DATABASE_URL to a throwaway Postgres. Never point this at staging or
 * production.
 */

import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { Client } from 'pg'

export const DATABASE_URL = process.env.DATABASE_URL ?? ''

const MIGRATIONS_DIR = new URL('../../supabase/migrations/', import.meta.url).pathname

/** Recreates Supabase's auth surface, and the two roles PostgREST connects as. */
const BOOTSTRAP = `
  drop schema if exists public cascade;
  create schema public;

  do $$ begin
    if not exists (select 1 from pg_roles where rolname = 'anon') then
      create role anon nologin noinherit;
    end if;
    if not exists (select 1 from pg_roles where rolname = 'authenticated') then
      create role authenticated nologin noinherit;
    end if;
  end $$;

  drop schema if exists auth cascade;
  create schema auth;

  create table auth.users (
    id uuid primary key default gen_random_uuid(),
    email text unique
  );

  -- Exactly how Supabase resolves the current user: from the JWT claims that
  -- PostgREST sets on the connection.
  create or replace function auth.uid() returns uuid
  language sql stable as $$
    select nullif(current_setting('request.jwt.claims', true)::json ->> 'sub', '')::uuid;
  $$;

  grant usage on schema public to anon, authenticated;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
`

/** RLS sits on top of grants, so the roles need table privileges to be tested. */
const GRANTS = `
  grant select, insert, update on all tables in schema public to authenticated;
  grant usage, select on all sequences in schema public to authenticated;
  grant execute on all functions in schema public to authenticated;
  -- anon deliberately gets table grants too, so that "anon cannot read"
  -- proves the POLICY is doing the work rather than a missing GRANT.
  grant select on all tables in schema public to anon;
`

export async function connect(): Promise<Client> {
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  return client
}

export async function resetSchema(client: Client): Promise<void> {
  await client.query('create extension if not exists pgcrypto')
  await client.query(BOOTSTRAP)

  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort()
  for (const file of files) {
    const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8')
    await client.query(sql)
  }

  await client.query(GRANTS)
}

export interface Fixture {
  centerA: string
  centerB: string
  roomA1: string
  roomA2: string
  roomB1: string
  childA1: string
  childA2: string
  childB1: string
  /** Left roomA1 nine days ago — inside the 14-day handoff window. */
  childA1Departed: string
  /** Left roomA1 forty days ago — well outside it. */
  childA1LongGone: string
  teacherA1: string
  teacherA2: string
  directorA: string
  teacherB1: string
}

/**
 * Two centers, so every isolation test has a real other tenant to fail against.
 * Seeded as the owner, with RLS bypassed — this is setup, not a test.
 */
export async function seed(client: Client): Promise<Fixture> {
  const { rows } = await client.query<Fixture>(`
    with
      org_a as (insert into organization (name) values ('Org A') returning id),
      org_b as (insert into organization (name) values ('Org B') returning id),
      c_a as (
        insert into center (organization_id, name)
        select id, 'Center A' from org_a returning id
      ),
      c_b as (
        insert into center (organization_id, name)
        select id, 'Center B' from org_b returning id
      ),
      r_a1 as (
        insert into classroom (center_id, name, age_band, is_ga_prek)
        select id, 'Pre-K A', 4, true from c_a returning id
      ),
      r_a2 as (
        insert into classroom (center_id, name, age_band)
        select id, 'Toddler A', 2 from c_a returning id
      ),
      r_b1 as (
        insert into classroom (center_id, name, age_band)
        select id, 'Pre-K B', 4 from c_b returning id
      ),
      u as (
        insert into auth.users (email) values
          ('teacher.a1@example.test'),
          ('teacher.a2@example.test'),
          ('director.a@example.test'),
          ('teacher.b1@example.test')
        returning id, email
      ),
      au as (
        insert into app_user (id, email, full_name)
        select id, email, email from u returning id, email
      ),
      s as (
        insert into staff (center_id, user_id, role, classroom_ids)
        select (select id from c_a), (select id from au where email = 'teacher.a1@example.test'),
               'teacher'::staff_role, array[(select id from r_a1)]
        union all
        select (select id from c_a), (select id from au where email = 'teacher.a2@example.test'),
               'teacher'::staff_role, array[(select id from r_a2)]
        union all
        select (select id from c_a), (select id from au where email = 'director.a@example.test'),
               'director'::staff_role, '{}'::uuid[]
        union all
        select (select id from c_b), (select id from au where email = 'teacher.b1@example.test'),
               'teacher'::staff_role, array[(select id from r_b1)]
        returning id
      ),
      ch as (
        insert into child (center_id, first_name, last_name, date_of_birth) values
          ((select id from c_a), 'Maya',   'A', date '2021-05-01'),
          ((select id from c_a), 'Jonah',  'A', date '2023-05-01'),
          ((select id from c_b), 'Rosa',   'B', date '2021-05-01'),
          ((select id from c_a), 'Dee',    'A', date '2021-05-01'),
          ((select id from c_a), 'Ellis',  'A', date '2021-05-01')
        returning id, first_name
      ),
      e as (
        insert into enrollment (center_id, child_id, classroom_id, started_on, program_start, ended_on, ended_reason)
        select (select id from c_a), (select id from ch where first_name = 'Maya'),
               (select id from r_a1), current_date - 200, current_date - 200, null::date, null::text
        union all
        select (select id from c_a), (select id from ch where first_name = 'Jonah'),
               (select id from r_a2), current_date - 200, current_date - 200, null::date, null::text
        union all
        select (select id from c_b), (select id from ch where first_name = 'Rosa'),
               (select id from r_b1), current_date - 200, current_date - 200, null::date, null::text
        -- Promoted out of roomA1 nine days ago: the previous teacher still owes
        -- a passport sign-off and must keep access.
        union all
        select (select id from c_a), (select id from ch where first_name = 'Dee'),
               (select id from r_a1), current_date - 200, current_date - 200,
               current_date - 9, 'promoted'
        -- Left forty days ago: the grace window has closed.
        union all
        select (select id from c_a), (select id from ch where first_name = 'Ellis'),
               (select id from r_a1), current_date - 200, current_date - 200,
               current_date - 40, 'withdrawn'
        returning id
      )
    select
      (select id from c_a)::text  as "centerA",
      (select id from c_b)::text  as "centerB",
      (select id from r_a1)::text as "roomA1",
      (select id from r_a2)::text as "roomA2",
      (select id from r_b1)::text as "roomB1",
      (select id from ch where first_name = 'Maya')::text  as "childA1",
      (select id from ch where first_name = 'Jonah')::text as "childA2",
      (select id from ch where first_name = 'Rosa')::text  as "childB1",
      (select id from ch where first_name = 'Dee')::text   as "childA1Departed",
      (select id from ch where first_name = 'Ellis')::text as "childA1LongGone",
      (select id from au where email = 'teacher.a1@example.test')::text as "teacherA1",
      (select id from au where email = 'teacher.a2@example.test')::text as "teacherA2",
      (select id from au where email = 'director.a@example.test')::text as "directorA",
      (select id from au where email = 'teacher.b1@example.test')::text as "teacherB1",
      (select count(*) from s) as staff_count,
      (select count(*) from e) as enrollment_count
  `)

  const fixture = rows[0]
  if (!fixture) throw new Error('Seed returned no rows')
  return fixture
}

export interface QueryResult<T> {
  rows: T[]
  /** Rows actually affected. For a write with no matching policy this is 0. */
  rowCount: number
  error: string | null
}

/**
 * Run SQL as a given signed-in user, exactly as PostgREST would: role
 * `authenticated`, JWT `sub` claim set, inside a transaction that is always
 * rolled back so tests cannot leak into one another.
 */
export async function asUser<T = Record<string, unknown>>(
  client: Client,
  userId: string | null,
  sql: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  await client.query('begin')
  try {
    if (userId === null) {
      await client.query('set local role anon')
      await client.query("select set_config('request.jwt.claims', '', true)")
    } else {
      await client.query('set local role authenticated')
      await client.query("select set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ sub: userId, role: 'authenticated' }),
      ])
    }
    const result = await client.query(sql, params)
    return { rows: result.rows as T[], rowCount: result.rowCount ?? 0, error: null }
  } catch (error) {
    return {
      rows: [],
      rowCount: 0,
      error: error instanceof Error ? error.message : String(error),
    }
  } finally {
    await client.query('rollback')
  }
}

/**
 * The direct-API test. Mimics a forged PostgREST request: the caller supplies
 * their own center_id filter and we prove the policy, not the app's data layer,
 * is what stops them.
 */
export async function forgedRead(
  client: Client,
  userId: string,
  table: string,
  centerId: string
): Promise<number> {
  const result = await asUser<{ count: string }>(
    client,
    userId,
    `select count(*)::text as count from ${table} where center_id = $1`,
    [centerId]
  )
  if (result.error) return 0
  return Number(result.rows[0]?.count ?? '0')
}
