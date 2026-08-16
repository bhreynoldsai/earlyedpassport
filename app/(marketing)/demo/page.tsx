import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Book a demo' }

/**
 * TODO(demo-form): this page collects nothing yet — there is no form handler and
 * no destination for a submission. Wire it to a real inbox before the site goes
 * live. A form that silently drops a director's request is worse than no form.
 */
export default function DemoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-[length:var(--text-display)] font-semibold">Book a demo</h1>
      <p className="mt-4 text-[length:var(--text-body-lg)] text-text-muted">
        Twenty minutes, on a screen share. We will build a real week for one of your classrooms
        while you watch, and print it. If it isn&rsquo;t faster than what you do now, we&rsquo;ll
        say so.
      </p>

      <p className="mt-8 rounded-md border border-border bg-surface p-6 text-[length:var(--text-body-lg)]">
        Email{' '}
        <a
          className="font-semibold text-accent-text underline"
          href="mailto:bernard@truenorth-inc.com"
        >
          bernard@truenorth-inc.com
        </a>{' '}
        with your center&rsquo;s name and how many classrooms you run, and we&rsquo;ll send back two
        times this week.
      </p>
    </div>
  )
}
