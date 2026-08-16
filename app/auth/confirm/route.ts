/**
 * Where every emailed auth link lands. Ticket T-0.5.
 *
 * Supabase's invite and password-reset emails do not carry a session — they
 * carry a `token_hash` that only a SERVER can redeem, via `verifyOtp()`. A
 * browser-only "detect the URL hash" approach (the older implicit-flow
 * pattern) cannot see this token at all: GoTrue's own `/verify` endpoint
 * already resolved it server-side before ever redirecting here, and what
 * lands in this request is a query param, readable only where a request
 * object exists — which is exactly why this is a Route Handler and not a
 * client component.
 *
 * `code` is handled too, defensively: it is not the shape these two flows
 * currently produce, but a shape a future flow (OAuth sign-in, say) might.
 *
 * `next` is restricted to the two pages that actually expect a fresh
 * recovery/invite session. Accepting an arbitrary `next` would turn a
 * password-reset email into an open redirect.
 */

import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'

/**
 * A real union, not just a runtime Set — `next.config.ts` has `typedRoutes`
 * on, so `redirect()` only accepts a route it can verify exists. Typing this
 * as `string` would silently defeat that check for the one redirect in the
 * app that is built from a URL param instead of a literal.
 */
type SafeNext = '/invite' | '/reset-password' | '/'
const ALLOWED_NEXT: readonly SafeNext[] = ['/invite', '/reset-password']

function resolveNext(requested: string | null): SafeNext {
  return ALLOWED_NEXT.find((allowed) => allowed === requested) ?? '/'
}

export async function GET(request: NextRequest): Promise<never> {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const next = resolveNext(searchParams.get('next'))

  const supabase = await createServerClient()

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) redirect(next)
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) redirect(next)
  }

  // Expired, already used, or malformed. The destination page's own
  // no-session state explains this in plain words — this route never renders
  // anything itself.
  redirect('/sign-in?expired=1')
}
