import type { Metadata } from 'next'
import { ClassicalButton } from '@/components/marketing/classical-button'

export const metadata: Metadata = { title: 'Pricing' }

/** Pricing confirmed by Bernard: $149/center/mo for a single location. */
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
    tinted: false,
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
    tinted: true,
  },
]

const FAQ = [
  {
    q: 'What happens to our data if we leave?',
    a: 'You take it. Everything exports as spreadsheets and PDFs, including the documents you uploaded. That is in the contract, not just on this page.',
  },
  {
    q: 'Do you replace Work Sampling Online?',
    a: 'No. Georgia Pre-K classrooms use WSO and we do not try to be your assessment system. We make the evidence easier to gather and easier to copy across.',
  },
  {
    q: 'Whose standards is this based on?',
    a: 'Our own. We built the learning areas and activity library from real classroom practice, not a copy of any single state’s published standards.',
  },
]

export default function PricingPage() {
  return (
    <>
      <div
        style={{
          background:
            'linear-gradient(180deg, var(--color-classical-accent-100), var(--color-classical-bg) 70%)',
        }}
      >
        <section className="mx-auto max-w-[820px] px-6 py-16 md:py-20">
          <p className="mb-3 text-xs tracking-[0.1em] text-classical-accent-700 uppercase">
            Pricing
          </p>
          <h1 className="mb-4 font-normal text-[clamp(30px,4vw,44px)] leading-[1.1]">Pricing</h1>
          <p className="text-lg text-classical-text/80">
            We charge the center, once a month. We never charge families, and we never touch your
            tuition.
          </p>
        </section>
      </div>

      <section className="mx-auto max-w-[940px] px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={
                plan.tinted
                  ? 'flex flex-col gap-3 rounded-classical-md bg-classical-accent-100 p-6 shadow-classical-sm'
                  : 'flex flex-col gap-3 rounded-classical-md bg-classical-surface p-6 shadow-classical-md'
              }
            >
              <span className="text-[10px] tracking-[0.1em] text-classical-accent uppercase">
                {plan.name}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-classical-heading text-[38px] font-semibold">
                  {plan.price}
                </span>
                {plan.name === 'One center' && (
                  <span className="text-sm text-classical-text/60">{plan.unit}</span>
                )}
              </div>
              {plan.name !== 'One center' && (
                <p className="text-sm text-classical-text/70">{plan.unit}</p>
              )}
              <ul className="mt-2 flex flex-col gap-2 text-[15px]">
                {plan.lines.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="text-classical-accent-700">✓</span>
                    {line}
                  </li>
                ))}
              </ul>
              <ClassicalButton
                href="/demo"
                variant={plan.tinted ? 'secondary' : 'primary'}
                block
                className="mt-4"
              >
                Book a demo
              </ClassicalButton>
            </div>
          ))}
        </div>
      </section>

      <hr className="mx-auto max-w-[820px] border-classical-divider" />

      <section className="mx-auto max-w-[820px] px-6 py-12">
        <h2 className="mb-4 text-2xl font-semibold">Before you ask</h2>
        <div className="flex flex-col gap-4">
          {FAQ.map((item) => (
            <div key={item.q}>
              <h3 className="mb-1.5 text-[17px] font-semibold">{item.q}</h3>
              <p className="text-[15px] leading-relaxed text-classical-text/80">{item.a}</p>
            </div>
          ))}
        </div>
        <ClassicalButton href="/demo" className="mt-6">
          Book a demo
        </ClassicalButton>
      </section>
    </>
  )
}
