import { cn } from '@/lib/utils'

interface SampleIndicator {
  label: string
  checked: boolean
}

interface SampleActivityPickerProps {
  activity: string
  indicators: SampleIndicator[]
}

/**
 * A sample activity picker — codes attaching themselves, as the paragraph
 * above this on How It Works describes. A stand-in for a real product
 * screenshot until one exists (see plate.tsx's TODO), not a screenshot of
 * the live app.
 *
 * Content is passed in rather than hardcoded here for the same reason as
 * SamplePlan/SamplePassport: components/ is scanned by the copy registry
 * lint, and app/(marketing) — the caller — is the exempted marketing-prose
 * path.
 */
export function SampleActivityPicker({ activity, indicators }: SampleActivityPickerProps) {
  return (
    <div className="flex flex-col gap-4 rounded-classical-md border border-classical-divider bg-classical-surface p-6 text-classical-text shadow-classical-md">
      <div>
        <p className="text-[11px] tracking-[0.1em] text-classical-accent uppercase">
          Adding an activity
        </p>
        <p className="font-classical-heading text-xl font-semibold">{activity}</p>
      </div>
      <ul className="flex flex-col gap-2.5">
        {indicators.map((item) => (
          <li key={item.label} className="flex items-start gap-2.5 text-sm">
            <span
              aria-hidden
              className={cn(
                'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border text-[10px] leading-none',
                item.checked
                  ? 'border-classical-accent bg-classical-accent-100 text-classical-accent-700'
                  : 'border-classical-divider text-transparent'
              )}
            >
              ✓
            </span>
            <span className={item.checked ? 'text-classical-text' : 'text-classical-text/50'}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
