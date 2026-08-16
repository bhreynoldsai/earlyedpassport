import { cn } from '@/lib/utils'
import { copy } from '@/lib/copy'
import { DOMAIN_NAMES, type DomainCode } from '@/lib/gelds/constants'

/**
 * DomainChip — acronym + color + optional full name.
 * Grey when uncovered, colored when covered.
 *
 * Domain color is CONTAINED, never ambient: it appears on chips, the coverage
 * bar, the left rule of an activity card, and the chooser's domain tiles. It
 * never colors a page background, a header, or a button.
 *
 * Never relies on colour alone — every chip carries its acronym. The CD chip
 * shows `CD`; it does not show the subdomain, because coverage counts five
 * domains and covering CD-MA covers CD.
 */

const DOMAIN_VAR: Record<DomainCode, string> = {
  PDM: 'var(--gelds-pdm)',
  SED: 'var(--gelds-sed)',
  APL: 'var(--gelds-apl)',
  CLL: 'var(--gelds-cll)',
  CD: 'var(--gelds-cd)',
}

export interface DomainChipProps {
  domain: DomainCode
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
  const swatch = covered ? DOMAIN_VAR[domain] : 'var(--gelds-uncovered)'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-sm border px-3 py-2',
        covered ? 'border-border-strong' : 'border-border',
        className
      )}
      // Colour is a 4px left rule with dark text on top, so a DECAL hue that
      // fails 4.5:1 as text still passes as a boundary. We never alter DECAL's
      // hue to make it pass.
      style={{ borderLeft: `4px solid ${swatch}` }}
    >
      <span className="text-[length:var(--text-small)] font-semibold tracking-wide">{domain}</span>
      {showName ? (
        <span className="text-[length:var(--text-small)] text-text-muted">
          {copy.indicators.domainPlain[domain]}
        </span>
      ) : null}
      <span className="sr-only">
        {covered
          ? copy.a11y.domainCovered(DOMAIN_NAMES[domain])
          : copy.a11y.domainNotCovered(DOMAIN_NAMES[domain])}
      </span>
    </span>
  )
}
