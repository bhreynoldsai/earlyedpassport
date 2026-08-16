/**
 * Session refresh in middleware. Ticket T-0.2.
 *
 * Server Components cannot write cookies, so nothing else in the app can renew
 * an expiring session. Without this, a teacher who leaves the app open through
 * a nap period comes back signed out and loses her place — which on a phone, in
 * a classroom, reads as "the app logged me out again".
 *
 * It also decides what is reachable while signed out. That is a convenience
 * boundary, not the security boundary: the real one is row level security in
 * the database, which holds even if this file is wrong.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './database.types'
import { PUBLIC_SUPABASE_KEY, PUBLIC_SUPABASE_URL } from './env'

/** Reachable without a session. Everything else redirects to sign-in. */
const PUBLIC_PREFIXES = [
  '/', // marketing home
  '/how-it-works',
  '/pricing',
  '/why',
  '/demo',
  '/offline',
  '/sign-in',
  '/invite',
  '/reset-password',
  // Where every invite/reset email link lands, before a session exists.
  '/auth/confirm',
]

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request })

  const url = PUBLIC_SUPABASE_URL
  const key = PUBLIC_SUPABASE_KEY
  // Not configured yet: let the request through rather than locking everyone
  // out of the marketing site. RLS still protects the data.
  if (!url || !key) return response

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // Do not put anything between creating the client and this call. It is what
  // refreshes the token and writes the new cookie onto `response`.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  if (!user && !isPublic(pathname)) {
    const signIn = request.nextUrl.clone()
    signIn.pathname = '/sign-in'
    // So she lands back where she was trying to go, not on a generic home page.
    signIn.searchParams.set('next', pathname)
    return NextResponse.redirect(signIn)
  }

  return response
}
