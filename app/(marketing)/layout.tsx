import Link from 'next/link'
import type { Route } from 'next'
import { Cormorant_Garamond, Lora } from 'next/font/google'
import { copy } from '@/lib/copy'
import { cn } from '@/lib/utils'
import { LogoMark } from '@/components/marketing/logo-mark'
import { ClassicalButton } from '@/components/marketing/classical-button'

/**
 * Marketing site shell. Five pages, no more (DESIGN-BRIEF §8).
 *
 * Redesigned to the "Classical" design system (design handoff, 2026): warm
 * gold accent, Cormorant Garamond + Lora, editorial/outline-first — see
 * app/globals.css's .classical block for the token layer. This is scoped to
 * the marketing route group on purpose: the in-app product UI keeps its
 * teal/Inter tokens untouched (out of scope for this handoff — "decide
 * separately with the team" whether it adopts this palette later).
 *
 * Long-form marketing prose lives inline in these pages rather than in
 * lib/copy.ts. The copy registry governs the product UI, where strings are
 * reused and translated; a sales paragraph is neither.
 */

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--classical-font-heading',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--classical-font-body',
  display: 'swap',
})

const NAV: { href: Route; label: string }[] = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/why', label: 'Why we built it' },
]

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'classical flex min-h-dvh flex-col bg-classical-bg text-classical-text',
        cormorantGaramond.variable,
        lora.variable
      )}
    >
      <header className="border-b border-classical-divider">
        <nav
          className="mx-auto flex max-w-5xl flex-wrap items-center gap-6 px-6 py-4"
          aria-label="Main"
        >
          <Link href="/" className="mr-auto flex items-center gap-2.5">
            <LogoMark className="h-[26px] w-[26px] shrink-0 text-classical-accent" />
            <span className="font-classical-heading text-lg font-semibold text-classical-text">
              {copy.product.name}
            </span>
          </Link>
          <div className="flex flex-wrap items-center gap-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-classical-text hover:text-classical-accent-700"
              >
                {item.label}
              </Link>
            ))}
            <ClassicalButton href="/demo">Book a demo</ClassicalButton>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-classical-divider bg-classical-surface">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 text-xs text-classical-text/70">
          <p>{copy.standards.attribution}</p>
          <p>
            {copy.standards.notEndorsed} We are not affiliated with, endorsed by, or approved by
            DECAL.
          </p>
          <p>
            Your center owns its data. You can export all of it at any time. Children never get
            accounts. Nothing here is sold, and nothing here is used to train anyone&rsquo;s model.
          </p>
          <p className="text-classical-text/50">
            © {new Date(Date.UTC(2026, 0, 1)).getUTCFullYear()} {copy.product.name}
          </p>
        </div>
      </footer>
    </div>
  )
}
