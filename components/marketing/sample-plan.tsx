import { Tag } from './tag'

interface SampleRow {
  day: string
  activity: string
  domain: string
}

interface SamplePlanProps {
  weekOf: string
  theme: string
  rows: SampleRow[]
}

/**
 * A sample weekly plan — what the hero's "See a sample plan" CTA promises,
 * and a stand-in for a real product screenshot until one exists (see
 * plate.tsx's TODO). Deliberately not presented as a screenshot of the live
 * app: a plan a center might actually run, one line per day, a plain-English
 * GELDS area next to every activity — the same shape the printed plan takes.
 *
 * Content is passed in rather than hardcoded here: this file lives under
 * components/, which the copy registry lint scans (unlike app/(marketing),
 * which is exempt as marketing prose) — see the caller in app/(marketing)/page.tsx.
 */
export function SamplePlan({ weekOf, theme, rows }: SamplePlanProps) {
  return (
    <div className="flex flex-col gap-4 rounded-classical-md border border-classical-divider bg-classical-surface p-6 shadow-classical-md">
      <div>
        <p className="text-[11px] tracking-[0.1em] text-classical-accent uppercase">
          Week of {weekOf}
        </p>
        <p className="font-classical-heading text-xl font-semibold">{theme}</p>
      </div>
      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <li
            key={row.day}
            className="flex flex-col gap-1.5 border-b border-classical-divider pb-3 last:border-0 last:pb-0"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-classical-heading text-sm font-semibold text-classical-text/70">
                {row.day}
              </span>
              <Tag variant="outline">{row.domain}</Tag>
            </div>
            <p className="text-sm text-classical-text">{row.activity}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
