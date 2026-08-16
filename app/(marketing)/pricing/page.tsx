import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pricing' }

/**
 * TODO(pricing): every number on this page is a placeholder. PROJECT-INSTRUCTIONS
 * Part 0.2 ("Price you have in mind") is still blank, so these are structure,
 * not a decision. Do not launch this page or quote these figures to a center
 * until Bernard sets them. `pnpm lint:release` fails on this marker.
 */
const PLANS = [
  {
    name: 'One center',
    price: '$149',
    unit: 'per center, per month',
    lines: [
      'Every classroom at one location',
      'Every teacher, no per-seat charge',
      'Lesson planner and printed monitoring plans',
      'Child records, passports and forms tracking',
      'One-click export of everything you have',
    ],
  },
  {
    name: 'Multiple centers',
    price: 'Let’s talk',
    unit: 'for owners with more than one location',
    lines: [
      'Everything in One center, at every location',
      'One dashboard across all of them',
      'Help moving your existing records in',
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-[length:var(--text-display)] font-semibold">Pricing</h1>
      <p className="mt-4 text-[length:var(--text-body-lg)] text-text-muted">
        We charge the center, once a month. We never charge families, and we never touch your
        tuition.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className="flex flex-col gap-4 rounded-md border border-border bg-surface p-6 shadow-[var(--shadow-card)]"
          >
            <h2 className="text-[length:var(--text-h2)] font-semibold">{plan.name}</h2>
            <p>
              <span className="text-[length:var(--text-display)] font-semibold">{plan.price}</span>
              <span className="ml-2 text-[length:var(--text-small)] text-text-muted">
                {plan.unit}
              </span>
            </p>
            <ul className="flex flex-col gap-2">
              {plan.lines.map((line) => (
                <li key={line} className="flex gap-3 text-[length:var(--text-body)]">
                  <span aria-hidden className="text-good">
                    ✓
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-md border border-border bg-attention-soft p-6">
        <h2 className="text-[length:var(--text-h2)] font-semibold">Before you ask</h2>
        <dl className="mt-4 flex flex-col gap-4 text-[length:var(--text-body)]">
          <div>
            <dt className="font-semibold">What happens to our data if we leave?</dt>
            <dd className="text-text-muted">
              You take it. Everything exports as spreadsheets and PDFs, including the documents you
              uploaded. That is in the contract, not just on this page.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Do you replace Work Sampling Online?</dt>
            <dd className="text-text-muted">
              No. Georgia Pre-K classrooms use WSO and we do not try to be your assessment system.
              We make the evidence easier to gather and easier to copy across.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Is this DECAL approved?</dt>
            <dd className="text-text-muted">
              No — DECAL does not approve products. Our plan template is built to carry the
              components DECAL requires, and we quote the GELDS standards with attribution.
            </dd>
          </div>
        </dl>
      </div>

      <Link
        href="/demo"
        className="mt-10 inline-flex min-h-[var(--tap-primary)] items-center rounded-sm bg-accent px-6 text-[length:var(--text-body-lg)] font-semibold text-white hover:bg-accent-hover"
      >
        Book a demo
      </Link>
    </div>
  )
}
