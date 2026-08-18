import { copy } from '@/lib/copy'
import { PATHWAY_CODES, type PathwayCode } from '@/lib/framework/constants'
import { DomainChip } from './domain-chip'

/**
 * CoverageBar — six DomainChips plus a plain-language line.
 *
 * It NEVER blocks saving and it never says "invalid". Coverage changes the
 * prominence of Print / Post; it never changes its availability.
 */

export interface CoverageBarProps {
  covered: ReadonlySet<PathwayCode>
}

export function CoverageBar({ covered }: CoverageBarProps) {
  const count = PATHWAY_CODES.filter((d) => covered.has(d)).length
  const allCovered = count === PATHWAY_CODES.length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {PATHWAY_CODES.map((domain) => (
          <DomainChip key={domain} domain={domain} covered={covered.has(domain)} />
        ))}
      </div>
      <p className="text-[length:var(--text-small)] text-text-muted">
        {allCovered
          ? copy.planner.coverageAll
          : copy.planner.coverageLine(count, PATHWAY_CODES.length)}
      </p>
    </div>
  )
}
