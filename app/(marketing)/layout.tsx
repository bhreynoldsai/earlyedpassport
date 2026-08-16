import Link from 'next/link'
import { copy } from '@/lib/copy'

/**
 * Marketing site shell. Five pages, no more (DESIGN-BRIEF §8).
 *
 * Same tokens, same type scale, same teal as the product — a director who books
 * a demo has to recognise the app when she sees it.
 *
 * Long-form marketing prose lives inline in these pages rather than in
 * lib/copy.ts. The copy registry governs the product UI, where strings are
 * reused and translated; a sales paragraph is neither.
 */

const NAV = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/why', label: 'Why we built it' },
] as const

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border bg-surface">
        <nav
          className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-4"
          aria-label="Main"
        >
          <Link href="/" className="text-[length:var(--text-h2)] font-semibold text-accent-text">
            {copy.product.name}
          </Link>
          <div className="ml-auto flex flex-wrap items-center gap-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[length:var(--text-body)] text-text-muted hover:text-text"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/demo"
              className="inline-flex min-h-[var(--tap-min)] items-center rounded-sm bg-accent px-4 text-[length:var(--text-body)] font-semibold text-white hover:bg-accent-hover"
            >
              Book a demo
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-[length:var(--text-small)] text-text-muted">
          <p>{copy.standards.attribution}</p>
          <p>
            {copy.standards.notEndorsed} We are not affiliated with, endorsed by, or approved by
            DECAL.
          </p>
          <p>
            Your center owns its data. You can export all of it at any time. Children never get
            accounts. Nothing here is sold, and nothing here is used to train anyone&rsquo;s model.
          </p>
          <p className="text-text-faint">
            © {new Date(Date.UTC(2026, 0, 1)).getUTCFullYear()} {copy.product.name}
          </p>
        </div>
      </footer>
    </div>
  )
}
