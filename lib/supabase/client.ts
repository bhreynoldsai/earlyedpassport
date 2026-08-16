'use client'

/**
 * Supabase client for the browser. Ticket T-0.2.
 *
 * Carries the anon key and the signed-in user's session, which means every
 * query it makes is subject to row level security. That is the whole security
 * model: this client is *supposed* to be reachable by the user, because the
 * database is what decides what they can see.
 *
 * No ORM, deliberately. RLS is the boundary and an ORM tempts you around it.
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'
import { requireSupabaseKey, requireSupabaseUrl } from './env'

export function createClient() {
  // Both throw rather than letting Supabase build a client against `undefined`
  // and surface it later as a confusing 401.
  return createBrowserClient<Database>(requireSupabaseUrl(), requireSupabaseKey())
}
