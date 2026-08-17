import { ClassicalButton } from '@/components/marketing/classical-button'
import { Plate } from '@/components/marketing/plate'
import { Tag } from '@/components/marketing/tag'

/**
 * Home. Above the fold: the one sentence a director understands immediately,
 * the buyer and the state named, one primary button, one secondary.
 *
 * TODO(marketing-assets): both plates on this page are still placeholders —
 * a real phone screenshot of next week's plan and a real passport page.
 * DESIGN-BRIEF §8 says not to launch with an abstract stand-in; see
 * components/marketing/plate.tsx for what's already known to be needed.
 */

const STEPS = [
  {
    step: 'Pick your theme',
    body: 'Next week starts as a copy of this week, never as a blank grid. Change the theme and keep what worked.',
  },
  {
    step: 'Tap activities',
    body: 'Pick from a library written for your age band. The GELDS codes attach behind the scenes — your teacher never types one.',
  },
  {
    step: 'Print and post',
    body: 'One page per week, codes next to every activity, ready for the wall and for the monitoring binder.',
  },
]

const CHECKLIST = [
  'Your center owns its data. One click exports all of it, forms and photos included.',
  'Encrypted in transit and at rest, photos included. No public buckets.',
  'Children never get accounts.',
  'A teacher can only see her own rooms — enforced in the database, not just the screen.',
  'A missing immunization form never blocks a child from being enrolled.',
  'Nothing is sold, and nothing is used to train anyone else’s model.',
]

export default function HomePage() {
  return (
    <>
      <div
        style={{
          background:
            'linear-gradient(180deg, var(--color-classical-accent-100), var(--color-classical-bg) 85%)',
        }}
      >
        <section className="mx-auto grid max-w-5xl gap-10 px-6 py-16 md:grid-cols-[1.1fr_1fr] md:items-center md:py-24">
          <div>
            <p className="mb-3 text-xs tracking-[0.1em] text-classical-accent-700 uppercase">
              For Georgia child care centers
            </p>
            <h1 className="mb-4 font-normal text-[clamp(34px,4.6vw,52px)] leading-[1.08]">
              Weekly lesson plans with{' '}
              <span className="text-classical-accent-700">GELDS codes</span> already on them — in 15
              minutes, not 2 hours.
            </h1>
            <p className="mb-6 max-w-[46ch] text-lg text-classical-text/80">
              Your teacher picks a theme on Friday afternoon and prints a plan that carries every
              component DECAL asks for.
            </p>
            <div className="flex flex-wrap gap-3">
              <ClassicalButton href="/demo" className="min-h-12 px-6 text-base">
                Book a demo
              </ClassicalButton>
              <ClassicalButton
                href="/how-it-works"
                variant="secondary"
                className="min-h-12 px-6 text-base"
              >
                See a sample plan
              </ClassicalButton>
            </div>
          </div>
          <div>
            <Plate
              placeholder="Drop a phone screenshot of next week's plan"
              className="aspect-[4/5] w-full"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Tag>Moving &amp; Growing</Tag>
              <Tag>Talking &amp; Reading</Tag>
              <Tag variant="outline">+3 more</Tag>
            </div>
          </div>
        </section>
      </div>

      <section className="border-y border-classical-divider bg-classical-surface">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="mb-8 text-[26px] font-semibold">Three steps, every Friday</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((item, index) => (
              <div
                key={item.step}
                className="flex flex-col gap-2 rounded-classical-md bg-classical-accent-100 p-4 shadow-classical-sm"
              >
                <span className="text-[10px] tracking-[0.1em] text-classical-accent uppercase">
                  Step {index + 1}
                </span>
                <span className="font-classical-heading text-lg font-semibold">{item.step}</span>
                <p className="text-[13px] text-classical-text/80">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-classical-neutral-900 text-classical-neutral-100">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <div className="mb-3 h-9 w-9 text-classical-accent-400">
              <svg
                viewBox="0 0 64 64"
                width="100%"
                height="100%"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M32 16 C24 13 14 14 8 18 L8 46 C14 42 24 41 32 44" />
                <path d="M32 16 C40 13 50 14 56 18 L56 46 C50 42 40 41 32 44" />
                <line x1="32" y1="16" x2="32" y2="44" />
              </svg>
            </div>
            <h2 className="mb-3 text-[26px] font-semibold text-classical-neutral-100">
              The new teacher isn&rsquo;t starting from zero
            </h2>
            <p className="max-w-[44ch] text-base leading-relaxed text-classical-neutral-100/85">
              When a child moves from Toddler 2 to Pre-K in August, everything known about her moves
              with her: how to say her name, what she can&rsquo;t eat, who can pick her up, what
              she&rsquo;s working on, and what the last teacher wished someone had told her. One
              page. The teacher who had her signs it off after the move, not in a hallway.
            </p>
          </div>
          <Plate
            placeholder="Drop a screenshot of a child's passport page"
            tone="accent-300"
            className="aspect-[4/3] w-full shadow-classical-lg"
          />
        </div>
      </section>

      <section className="border-t border-classical-divider bg-classical-surface">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="mb-8 text-[26px] font-semibold">What you can count on</h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {CHECKLIST.map((line) => (
              <li key={line} className="flex gap-2.5 text-[15px]">
                <span aria-hidden className="shrink-0 text-classical-accent-700">
                  ✓
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
