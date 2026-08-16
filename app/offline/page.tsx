import type { Metadata } from 'next'
import { copy } from '@/lib/copy'

export const metadata: Metadata = { title: 'Offline' }

/**
 * The fallback the service worker serves when a page was never cached and the
 * network is gone.
 *
 * Calm, not apologetic. It is not an error page — nothing has gone wrong and
 * nothing has been lost. Anything she already typed is on the phone and will
 * send itself. That is the only message that matters here.
 */
export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-4">
      <h1 className="text-[length:var(--text-h1)] font-semibold">{copy.states.offline}</h1>
      <p className="text-[length:var(--text-body-lg)] text-text-muted">{copy.save.savedOnPhone}</p>
    </main>
  )
}
