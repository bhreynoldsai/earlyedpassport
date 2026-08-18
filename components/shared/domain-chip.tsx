import { cn } from '@/lib/utils'
import { copy } from '@/lib/copy'
import { PATHWAY_NAMES, type PathwayCode } from '@/lib/framework/constants'

/**
 * DomainChip — acronym + color + optional full name.
 * Grey when uncovered, colored when covered.
 *
 * Domain color is CONTAINED, never ambient: it appears on chips, the coverage
 * bar, the left rule of an activity card, and the chooser's pathway tiles. It
 * never colors a page background, a header, or a button.
 *
 * Never relies on colour alone — every chip carries its two-letter code.
 */

const PATHWAY_VAR: Record<PathwayCode, string> = {
  CM: 'var(--compass-cm)',
  GS: 'var(--compass-gs)',
  FW: 'var(--compass-fw)',
  BF: 'var(--compass-bf)',
  TD: 'var(--compass-td)',
  WM: 'var(--compass-wm)',
}

export interface DomainChipProps {
  domain: PathwayCode
  covered?: boolean
  showName?: boolean
  className?: string
}

export function DomainChip({
  domain,
  covered = false,
  showName = false,
  className,
}: DomainChipProps) {
  const swatch = covered ? PATHWAY_VAR[domain] : 'var(--compass-uncovered)'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-sm border px-3 py-2',
        covered ? 'border-border-strong' : 'border-border',
        className
      )}
      // Colour is a 4px left rule with dark text on top, so it works as a
      // boundary regardless of contrast as text.
      style={{ borderLeft: `4px solid ${swatch}` }}
    >
      <span className="text-[length:var(--text-small)] font-semibold tracking-wide">{domain}</span>
      {showName ? (
        <span className="text-[length:var(--text-small)] text-text-muted">
          {copy.indicators.pathwayPlain[domain]}
        </span>
      ) : null}
      <span className="sr-only">
        {covered
          ? copy.a11y.pathwayCovered(PATHWAY_NAMES[domain])
          : copy.a11y.pathwayNotCovered(PATHWAY_NAMES[domain])}
      </span>
    </span>
  )
}
