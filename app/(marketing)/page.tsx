import Link from 'next/link'
import { CoverageBar } from '@/components/shared/coverage-bar'
import type { DomainCode } from '@/lib/gelds/constants'

/**
 * Home. Above the fold: the one sentence a director understands immediately,
 * the buyer and the state named, one primary button, one secondary.
 *
 * TODO(marketing-assets): the hero currently shows a live CoverageBar rather
 * than the required real screenshot of the week grid on a phone. Swap it for
 * the screenshot once T-1.4 ships — an abstract stand-in is exactly what
 * DESIGN-BRIEF §8 says not to launch with. No stock photos of children.
 */

const DEMO_COVERED = new Set<DomainCode>(['PDM', 'CLL', 'SED', 'CD'])

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="flex flex-col gap-6">
            <h1 className="text-[length:var(--text-display)] font-semibold leading-tight">
              Weekly lesson plans with GELDS codes already on them — in 15 minutes, not 2 hours.
            </h1>
            <p className="text-[length:var(--text-body-lg)] text-text-muted">
              Built for Georgia child care centers and Pre-K classrooms. Your teacher picks a theme
              on Friday afternoon and prints a plan that carries every component DECAL asks for.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/demo"
                className="inline-flex min-h-[var(--tap-primary)] items-center rounded-sm bg-accent px-6 text-[length:var(--text-body-lg)] font-semibold text-white hover:bg-accent-hover"
              >
                Book a demo
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex min-h-[var(--tap-primary)] items-center rounded-sm border border-border-strong px-6 text-[length:var(--text-body-lg)] font-semibold hover:bg-surface-sunk"
              >
                See a sample plan
              </Link>
            </div>
          </div>

          <div className="rounded-md border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
            <p className="mb-4 text-[length:var(--text-small)] text-text-faint">
              The coverage bar, as a teacher sees it mid-week
            </p>
            <CoverageBar covered={DEMO_COVERED} />
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-[length:var(--text-h1)] font-semibold">Three steps, every Friday</h2>
          <ol className="mt-6 grid gap-6 md:grid-cols-3">
            {[
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
            ].map((item, index) => (
              <li key={item.step} className="flex flex-col gap-2">
                <span className="gelds-code">Step {index + 1}</span>
                <h3 className="text-[length:var(--text-h2)] font-semibold">{item.step}</h3>
                <p className="text-[length:var(--text-body)] text-text-muted">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-[length:var(--text-h1)] font-semibold">
          The new teacher isn&rsquo;t starting from zero
        </h2>
        <p className="mt-4 max-w-2xl text-[length:var(--text-body-lg)] text-text-muted">
          When a child moves from Toddler 2 to Pre-K in August, everything known about her moves
          with her: how to say her name, what she can&rsquo;t eat, who can pick her up, what
          she&rsquo;s working on, and what the last teacher wished someone had told her. One page.
          The teacher who had her signs it off after the move, not in a hallway.
        </p>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-[length:var(--text-h1)] font-semibold">What you can count on</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              'Your center owns its data. One click exports all of it, forms and photos included.',
              'Encrypted in transit and at rest, photos included. No public buckets.',
              'Children never get accounts.',
              'A teacher can only see her own rooms — enforced in the database, not just the screen.',
              'A missing immunization form never blocks a child from being enrolled.',
              'Nothing is sold, and nothing is used to train anyone else’s model.',
            ].map((line) => (
              <li key={line} className="flex gap-3 text-[length:var(--text-body)]">
                <span aria-hidden className="text-good">
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
