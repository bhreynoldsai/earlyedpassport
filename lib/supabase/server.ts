import 'server-only'

/**
 * Supabase clients for the server. Ticket T-0.2.
 *
 * Two of them, and the difference matters:
 *
 *   - `createServerClient()` carries the signed-in user's session. Use this for
 *     everything the product does. RLS applies.
 *   - `createServiceRoleClient()` BYPASSES ROW LEVEL SECURITY ENTIRELY. It
 *     exists for the GELDS importer and the seed script and nothing else.
 *
 * `import 'server-only'` makes it a build error to pull this file into a client
 * component, which is the accident that would otherwise ship a service role key
 * to a browser.
 */

import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set. See .env.example.`)
  return value
}

/** The normal path. Subject to RLS, as every product query must be. */
export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          } catch {
            // Called from a Server Component, where cookies are read-only. The
            // middleware refreshes the session instead, so this is safe to
            // swallow — see lib/supabase/middleware.ts.
          }
        },
      },
    }
  )
}

/**
 * BYPASSES RLS. Two callers only: the GELDS importer and the seed script.
 *
 * If you are reaching for this to make a product query work, the RLS policy is
 * wrong — fix the policy. Every use of this function is a place where a
 * multi-tenant leak cannot be caught by the database.
 */
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
