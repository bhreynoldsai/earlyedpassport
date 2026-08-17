import { cn } from '@/lib/utils'

interface PlateProps {
  placeholder: string
  className?: string
  tone?: 'accent-200' | 'accent-300'
}

/**
 * The `.plate` image treatment: product screenshots matted like a tipped-in
 * book plate, never full-bleed. `tone` stands in for the eventual photo's
 * background until real screenshots replace these — see the TODO below.
 *
 * TODO(marketing-assets): every Plate on the marketing pages is still a
 * placeholder. Once a real screenshot lands, give the <img> a sepia filter
 * (`sepia(0.22) saturate(0.82) contrast(1.05)`, per the design system) —
 * applying that filter to empty placeholder text does nothing, so it isn't
 * wired up here yet.
 */
export function Plate({ placeholder, className, tone = 'accent-200' }: PlateProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center border-[6px] border-classical-surface p-4 text-center text-[13px] text-classical-text/60 shadow-classical-md outline outline-1 outline-classical-divider',
        tone === 'accent-200' ? 'bg-classical-accent-200' : 'bg-classical-accent-300',
        className
      )}
    >
      {placeholder}
    </div>
  )
}
