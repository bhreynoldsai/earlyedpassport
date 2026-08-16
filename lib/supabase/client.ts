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

export function createClient() {
  return createBrowserClient<Database>(
    requirePublicEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requirePublicEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  )
}

/**
 * Fails loudly at the call site rather than letting Supabase construct a client
 * against `undefined` and surface it later as a confusing 401.
 */
function requirePublicEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
  // Next.js inlines these at build time, so they must be referenced literally.
  const value =
    name === 'NEXT_PUBLIC_SUPABASE_URL'
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!value) {
    throw new Error(`${name} is not set. Copy .env.example to .env.local and fill it in.`)
  }
  return value
}
