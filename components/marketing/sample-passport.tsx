interface SampleField {
  label: string
  value: string
}

interface SamplePassportProps {
  name: string
  pronunciation: string
  fields: SampleField[]
}

/**
 * A sample passport page — a stand-in for a real product screenshot until
 * one exists (see plate.tsx's TODO), and a fictional example, never a real
 * child's record (no real child data in this repo, ever — see CLAUDE.md).
 * The "Sample passport page" kicker keeps that unambiguous to a visitor.
 *
 * Content is passed in rather than hardcoded here for the same reason as
 * SamplePlan: components/ is scanned by the copy registry lint, and
 * app/(marketing) — the caller — is the exempted marketing-prose path.
 */
export function SamplePassport({ name, pronunciation, fields }: SamplePassportProps) {
  return (
    <div className="flex flex-col gap-4 rounded-classical-md border border-classical-divider bg-classical-surface p-6 text-classical-text shadow-classical-lg">
      <div>
        <p className="text-[11px] tracking-[0.1em] text-classical-accent uppercase">
          Sample passport page
        </p>
        <p className="font-classical-heading text-xl font-semibold">
          {name} <span className="font-normal text-classical-text/60">— {pronunciation}</span>
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {fields.map((field) => (
          <li
            key={field.label}
            className="flex flex-col gap-1 border-b border-classical-divider pb-3 last:border-0 last:pb-0"
          >
            <span className="text-[11px] tracking-wide text-classical-text/50 uppercase">
              {field.label}
            </span>
            <span className="text-sm text-classical-text">{field.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
