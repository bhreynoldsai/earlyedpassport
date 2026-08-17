import Link from 'next/link'
import type { Route } from 'next'
import { cn } from '@/lib/utils'

interface ClassicalButtonProps {
  href: string
  variant?: 'primary' | 'secondary'
  block?: boolean
  external?: boolean
  className?: string
  children: React.ReactNode
}

/**
 * Classical buttons are an accent outline, never a fill (design handoff:
 * "the primary is an accent outline, never a fill" — this system has no
 * solid-filled button anywhere).
 *
 * `href` is a plain string rather than a generic `Route<T>` prop: every
 * caller here passes one of a handful of hardcoded internal paths or a
 * mailto: link, so the extra generic machinery isn't worth it for what's a
 * small presentational component — the cast below is safe because we
 * control every call site.
 */
export function ClassicalButton({
  href,
  variant = 'primary',
  block = false,
  external = false,
  className,
  children,
}: ClassicalButtonProps) {
  const classes = cn(
    'inline-flex min-h-12 items-center justify-center gap-1.5 rounded-classical-md border px-6 font-classical-heading text-[15px] font-semibold transition-colors',
    variant === 'primary' &&
      'border-classical-accent text-classical-accent-700 hover:bg-classical-accent-100',
    variant === 'secondary' &&
      'border-classical-divider text-classical-text hover:bg-classical-text/5',
    block && 'w-full',
    className
  )

  if (external) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href as Route} className={classes}>
      {children}
    </Link>
  )
}
