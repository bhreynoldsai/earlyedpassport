import type { Metadata } from 'next'
import { LogoMark } from '@/components/marketing/logo-mark'
import { ClassicalButton } from '@/components/marketing/classical-button'

export const metadata: Metadata = { title: 'Book a demo' }

/**
 * TODO(demo-form): this page collects nothing yet — there is no form handler and
 * no destination for a submission. Wire it to a real inbox before the site goes
 * live. A form that silently drops a director's request is worse than no form.
 */
export default function DemoPage() {
  return (
    <div
      style={{
        background:
          'linear-gradient(180deg, var(--color-classical-accent-100), var(--color-classical-bg) 70%)',
      }}
    >
      <section className="mx-auto max-w-[640px] px-6 py-20 text-center md:py-24">
        <LogoMark className="mx-auto mb-4 h-11 w-11 text-classical-accent" />
        <h1 className="mb-4 font-normal text-[clamp(30px,4vw,44px)] leading-[1.1]">Book a demo</h1>
        <p className="mb-6 text-lg text-classical-text/80">
          Twenty minutes, on a screen share. We will build a real week for one of your classrooms
          while you watch, and print it. If it isn&rsquo;t faster than what you do now, we&rsquo;ll
          say so.
        </p>
        <div className="mx-auto flex max-w-[440px] flex-col gap-3 rounded-classical-md bg-classical-surface p-6 text-left shadow-classical-md">
          <p className="text-[15px] leading-relaxed">
            Email{' '}
            <a href="mailto:bernard@truenorth-inc.com" className="font-semibold">
              bernard@truenorth-inc.com
            </a>{' '}
            with your center&rsquo;s name and how many classrooms you run, and we&rsquo;ll send back
            two times this week.
          </p>
          <ClassicalButton href="mailto:bernard@truenorth-inc.com" external block>
            Email us
          </ClassicalButton>
        </div>
      </section>
    </div>
  )
}
