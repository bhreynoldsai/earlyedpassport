import { copy } from '@/lib/copy'
import { DOMAIN_CODES, type DomainCode } from '@/lib/gelds/constants'
import { DomainChip } from './domain-chip'

/**
 * CoverageBar — five DomainChips plus a plain-language line.
 *
 * It NEVER blocks saving and it never says "invalid". Coverage changes the
 * prominence of Print / Post; it never changes its availability.
 */

export interface CoverageBarProps {
  covered: ReadonlySet<DomainCode>
}

export function CoverageBar({ covered }: CoverageBarProps) {
  const count = DOMAIN_CODES.filter((d) => covered.has(d)).length
  const allCovered = count === DOMAIN_CODES.length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {DOMAIN_CODES.map((domain) => (
          <DomainChip key={domain} domain={domain} covered={covered.has(domain)} />
        ))}
      </div>
      <p className="text-[length:var(--text-small)] text-text-muted">
        {allCovered
          ? copy.planner.coverageAll
          : copy.planner.coverageLine(count, DOMAIN_CODES.length)}
      </p>
    </div>
  )
}
