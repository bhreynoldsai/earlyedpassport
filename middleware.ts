import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    /**
     * Everything except static assets and image files.
     *
     * `sw.js` and `manifest.webmanifest` are excluded deliberately: the service
     * worker must be fetchable while signed out, or a teacher whose session
     * expired overnight loses the offline shell as well as her session.
     */
    '/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
