/**
 * Supabase configuration, read in exactly one place. Ticket T-0.2.
 *
 * TWO NAMES FOR THE BROWSER KEY, and both are in the wild:
 *
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY   `sb_publishable_...`  new projects
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY          a JWT                 older projects
 *
 * Supabase renamed it. They are the same thing for our purposes: a key that is
 * *meant* to reach browsers, and which row level security — not secrecy — is
 * what stands behind. We accept either so that a project created this month and
 * one created last year both work without editing code.
 *
 * EVERY REFERENCE BELOW IS WRITTEN OUT LITERALLY, and must stay that way. Next
 * .js inlines `NEXT_PUBLIC_*` by textual substitution at build time, so a
 * computed lookup like `process.env[name]` typechecks, works on the server, and
 * is silently `undefined` in the browser bundle — a bug that only shows up
 * after deploy.
 */

export const PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

export const PUBLIC_SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const SETUP_HINT = 'Copy .env.example to .env.local and fill it in. See docs/SUPABASE-SETUP.md.'

export function requireSupabaseUrl(): string {
  if (!PUBLIC_SUPABASE_URL) throw new Error(`NEXT_PUBLIC_SUPABASE_URL is not set. ${SETUP_HINT}`)
  return PUBLIC_SUPABASE_URL
}

export function requireSupabaseKey(): string {
  if (!PUBLIC_SUPABASE_KEY) {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set (NEXT_PUBLIC_SUPABASE_ANON_KEY also accepted). ${SETUP_HINT}`
    )
  }
  return PUBLIC_SUPABASE_KEY
}

/** True when both are present. Used by middleware to degrade rather than crash. */
export function isSupabaseConfigured(): boolean {
  return Boolean(PUBLIC_SUPABASE_URL && PUBLIC_SUPABASE_KEY)
}

/**
 * SERVER ONLY. Bypasses row level security completely.
 *
 * Also renamed: new projects issue `sb_secret_...`. Accept both names, and
 * never, ever expose either — see the build-time guard in next.config.ts.
 */
export function requireServiceRoleKey(): string {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
  if (!value) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set (SUPABASE_SECRET_KEY also accepted). ' +
        'This key bypasses RLS — set it in the server environment only, never in a NEXT_PUBLIC_ variable.'
    )
  }
  return value
}
