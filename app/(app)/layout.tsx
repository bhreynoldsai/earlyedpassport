import { copy } from '@/lib/copy'
import { getStaffContext } from '@/lib/auth/session'
import { SignOutButton } from '@/components/auth/sign-out-button'

/**
 * BUILD-INSTRUCTIONS §3: `/(app)` is the authenticated product. No nav here
 * yet — My Room / Plans / Center are Phase 1+ routes that don't exist, and a
 * nav bar pointing at nothing is worse than no nav bar.
 *
 * No redirect-if-signed-out here: middleware already refuses an
 * unauthenticated request before it ever reaches this layout (`(app)` routes
 * are not in PUBLIC_PREFIXES). That's the security boundary. This layout only
 * has to handle the one state middleware can't see — a real session with no
 * `staff` row anywhere, which getStaffContext() returns as null.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const context = await getStaffContext()

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-4">
        <span className="text-[length:var(--text-h2)] font-semibold text-accent-text">
          {copy.product.name}
        </span>
        <SignOutButton />
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        {context ? (
          children
        ) : (
          <p className="text-[length:var(--text-body-lg)]">{copy.auth.noCenterYet}</p>
        )}
      </main>
    </div>
  )
}
