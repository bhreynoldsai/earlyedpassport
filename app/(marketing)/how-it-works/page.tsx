import type { Metadata } from 'next'
import { Plate } from '@/components/marketing/plate'
import { SampleActivityPicker } from '@/components/marketing/sample-activity-picker'
import { Tag } from '@/components/marketing/tag'

export const metadata: Metadata = { title: 'How it works' }

const SAMPLE_INDICATORS = [
  { label: 'Recites numbers up to 20 in sequence', checked: true },
  { label: 'Counts up to 10 objects, pointing to each one', checked: true },
  { label: 'Sorts objects by size or color', checked: false },
]

export default function HowItWorksPage() {
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
            How it works
          </p>
          <h1 className="mb-4 font-normal text-[clamp(30px,4vw,44px)] leading-[1.1]">
            How it works
          </h1>
          <p className="text-lg text-classical-text/80">
            A teacher with a phone in one hand and a toddler in the other. That is who this is
            designed for, and it is the only test that matters.
          </p>
        </section>
      </div>

      <section className="mx-auto max-w-[820px] px-6 py-12">
        <h2 className="mb-2 text-2xl font-semibold">Friday afternoon</h2>
        <p className="text-justify text-base leading-[1.65]">
          Your teacher opens the app on her phone and taps Plan next week. Last week is already
          there, copied. She changes the theme, swaps three activities, and the plan is done.
          Nothing starts from a blank page, because a blank page on a phone at 4:45pm is how a plan
          ends up half-written.
        </p>
      </section>

      <hr className="mx-auto max-w-[820px] border-classical-divider" />

      <section className="mx-auto max-w-[820px] px-6 py-12">
        <h2 className="mb-2 text-2xl font-semibold">The codes attach themselves</h2>
        <p className="mb-4 text-justify text-base leading-[1.65]">
          When she adds an activity, the app suggests the GELDS indicators that activity usually
          covers, already ticked. She glances and moves on. If she wants a specific one she picks it
          by what it says in plain English —{' '}
          <em>&ldquo;Recites numbers up to 20 in sequence&rdquo;</em> — and the code goes on the
          plan behind it. She never types CD-MA1.4a. She never sees a tree of 700 codes.
        </p>
        <SampleActivityPicker activity="Counting Bears" indicators={SAMPLE_INDICATORS} />
      </section>

      <hr className="mx-auto max-w-[820px] border-classical-divider" />

      <section className="border-y border-classical-divider bg-classical-surface">
        <div className="mx-auto max-w-[820px] px-6 py-12">
          <h2 className="mb-2 text-2xl font-semibold">Five areas, no scolding</h2>
          <p className="mb-4 text-justify text-base leading-[1.65]">
            A row of five chips across the top fills in as she works. When one is still grey there
            is a button that opens the library filtered to it. The app never says invalid, never
            turns red, and never stops her from printing an incomplete plan.
          </p>
          <div className="flex flex-wrap gap-2">
            <Tag>Moving &amp; Growing</Tag>
            <Tag>Feelings &amp; Friends</Tag>
            <Tag variant="neutral">How They Learn</Tag>
            <Tag>Talking &amp; Reading</Tag>
            <Tag variant="neutral">Thinking &amp; Learning</Tag>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[820px] px-6 py-12">
        <h2 className="mb-2 text-2xl font-semibold">Print and post</h2>
        <p className="mb-4 text-justify text-base leading-[1.65]">
          One page per week, landscape, black on white, 11pt. GELDS code next to every activity.
          Center, classroom, teacher, week and theme in the header. It is built to carry the
          components DECAL asks for on a Pre-K plan — 6.5 instructional hours, clock times matching
          your posted schedule, two daily read-alouds with titles and codes, a daily phonological
          awareness activity, transitions, outdoor play, small groups, differentiation, planned
          assessment. The parent copy is the same week with the codes stripped and a friendly line
          about what the class is learning.
        </p>
        <Plate
          placeholder="Drop the printed landscape weekly plan"
          tone="accent-300"
          className="aspect-[16/10] w-full max-w-[600px]"
        />
      </section>

      <hr className="mx-auto max-w-[820px] border-classical-divider" />

      <section className="bg-classical-neutral-900 text-classical-neutral-100">
        <div className="mx-auto max-w-[820px] px-6 py-16">
          <h2 className="mb-2 text-2xl font-semibold text-classical-neutral-100">
            And when a child changes rooms
          </h2>
          <p className="text-justify text-base leading-[1.65] text-classical-neutral-100/85">
            The director moves her. The new teacher gets one task: look at the passport. The old
            teacher gets one task: add anything the next teacher should know. Two taps each. She
            keeps access for two weeks after the move so she can actually finish it.
          </p>
        </div>
      </section>
    </>
  )
}
