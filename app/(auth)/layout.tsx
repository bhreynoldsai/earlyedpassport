import Link from 'next/link'
import { copy } from '@/lib/copy'

/**
 * Sign-in, invite acceptance, password reset. No nav — there is nothing to
 * navigate to yet. BUILD-INSTRUCTIONS §3: `/(auth)` is login, invite
 * acceptance, password reset.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 block text-center text-[length:var(--text-h2)] font-semibold text-accent-text"
        >
          {copy.product.name}
        </Link>
        <div className="rounded-md border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
          {children}
        </div>
      </div>
    </div>
  )
}
