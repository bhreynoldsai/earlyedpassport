import { cn } from '@/lib/utils'

interface TagProps {
  children: React.ReactNode
  variant?: 'accent' | 'outline' | 'neutral'
}

/**
 * The five learning areas are told apart by label, not color — one tag
 * style throughout (brand sheet). `outline` is what the brand sheet actually
 * uses for that five-tag row; `accent`/`neutral` cover the sample-tag and
 * "+3 more" treatments elsewhere in the mockups.
 */
export function Tag({ children, variant = 'accent' }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[3px] px-2.5 py-0.5 text-[11px] tracking-wide',
        variant === 'accent' && 'bg-classical-accent-100 text-classical-accent-800',
        variant === 'outline' && 'border border-classical-accent text-classical-accent-700',
        variant === 'neutral' && 'bg-classical-neutral-100 text-classical-text/70'
      )}
    >
      {children}
    </span>
  )
}
