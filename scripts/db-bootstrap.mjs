#!/usr/bin/env node
/**
 * Rebuild the schema from zero against any Postgres. Ticket T-0.2.
 *
 *   pnpm db:verify          apply every migration to a scratch database
 *   pnpm db:types           …then regenerate lib/supabase/database.types.ts
 *   pnpm db:types:check     …and fail if the committed types have drifted
 *
 * `supabase db reset` is the real command once the CLI is linked to a project,
 * but it needs Docker and the whole local stack. This does the part that
 * actually needs proving — that the numbered migrations reproduce the schema
 * from nothing, in order, with no manual step — against a plain Postgres, so
 * CI can run it on every push.
 *
 * Migrations are forward-only and never edited once applied. This script is the
 * thing that catches an edit that broke a fresh apply.
 */

import { execFileSync } from 'node:child_process'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import pg from 'pg'

const ROOT = new URL('..', import.meta.url).pathname
const MIGRATIONS = join(ROOT, 'supabase', 'migrations')
const TYPES_FILE = join(ROOT, 'lib', 'supabase', 'database.types.ts')

const adminUrl = process.env.DATABASE_URL
if (!adminUrl) {
  console.error('DATABASE_URL is not set. Point it at any throwaway Postgres.')
  process.exit(1)
}

const wantTypes = process.argv.includes('--types')
const checkOnly = process.argv.includes('--check')
const SCRATCH = 'eep_schema_check'

/**
 * Supabase provides these before any migration runs. Reproduced so a plain
 * Postgres can apply our migrations unchanged — the alternative is migrations
 * that only work on Supabase, which cannot be tested anywhere else.
 */
const SUPABASE_PRELUDE = `
  create extension if not exists pgcrypto;
  do $$ begin
    if not exists (select 1 from pg_roles where rolname = 'anon') then
      create role anon nologin noinherit;
    end if;
    if not exists (select 1 from pg_roles where rolname = 'authenticated') then
      create role authenticated nologin noinherit;
    end if;
    if not exists (select 1 from pg_roles where rolname = 'service_role') then
      create role service_role nologin noinherit bypassrls;
    end if;
  end $$;
  create schema if not exists auth;
  create table if not exists auth.users (
    id uuid primary key default gen_random_uuid(),
    email text unique
  );
  create or replace function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claims', true)::json ->> 'sub', '')::uuid;
  $$;
  grant usage on schema public, auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
`

function scratchUrl() {
  const url = new URL(adminUrl)
  url.pathname = `/${SCRATCH}`
  return url.toString()
}

async function main() {
  const admin = new pg.Client({ connectionString: adminUrl })
  await admin.connect()
  await admin.query(`drop database if exists ${SCRATCH} with (force)`)
  await admin.query(`create database ${SCRATCH}`)
  await admin.end()

  const db = new pg.Client({ connectionString: scratchUrl() })
  await db.connect()
  await db.query(SUPABASE_PRELUDE)

  const files = (await readdir(MIGRATIONS)).filter((f) => f.endsWith('.sql')).sort()
  if (files.length === 0) throw new Error('No migrations found.')

  for (const file of files) {
    const sql = await readFile(join(MIGRATIONS, file), 'utf8')
    try {
      await db.query(sql)
      console.log(`  applied ${file}`)
    } catch (error) {
      throw new Error(
        `${file} failed to apply to an empty database:\n  ${
          error instanceof Error ? error.message : String(error)
        }\n\nMigrations are forward-only. Add a new one rather than editing this.`
      )
    }
  }

  const { rows } = await db.query(
    `select count(*)::text as n from information_schema.tables where table_schema = 'public'`
  )
  console.log(`\nSchema rebuilt from zero: ${files.length} migrations, ${rows[0].n} tables.`)
  await db.end()

  if (!wantTypes) return

  console.log('\nGenerating types…')
  const generated = execFileSync(
    'npx',
    ['--yes', 'supabase@latest', 'gen', 'types', 'typescript', '--db-url', scratchUrl()],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }
  )

  const banner = [
    '// GENERATED FILE — DO NOT EDIT.',
    '//',
    '// Regenerate with `pnpm db:types` after adding a migration. CI runs',
    '// `pnpm db:types:check`, which rebuilds the schema from zero and fails if',
    '// this file has drifted from the migrations.',
    '',
  ].join('\n')

  const next = banner + generated

  if (checkOnly) {
    const current = await readFile(TYPES_FILE, 'utf8').catch(() => '')
    if (current.trim() !== next.trim()) {
      console.error(
        '\nlib/supabase/database.types.ts is out of date with the migrations.\n' +
          'Run `pnpm db:types` and commit the result.\n'
      )
      process.exit(1)
    }
    console.log('Types match the migrations.')
    return
  }

  await writeFile(TYPES_FILE, next, 'utf8')
  console.log(`Wrote ${TYPES_FILE}`)
}

main().catch((error) => {
  console.error(`\n${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
})
