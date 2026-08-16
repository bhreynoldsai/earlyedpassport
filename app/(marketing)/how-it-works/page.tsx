import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'How it works' }

const SECTIONS = [
  {
    heading: 'Friday afternoon',
    body: 'Your teacher opens the app on her phone and taps Plan next week. Last week is already there, copied. She changes the theme, swaps three activities, and the plan is done. Nothing starts from a blank page, because a blank page on a phone at 4:45pm is how a plan ends up half-written.',
  },
  {
    heading: 'The codes attach themselves',
    body: 'When she adds an activity, the app suggests the GELDS indicators that activity usually covers, already ticked. She glances and moves on. If she wants a specific one she picks it by what it says in plain English — “Recites numbers up to 20 in sequence” — and the code goes on the plan behind it. She never types CD-MA1.4a. She never sees a tree of 700 codes.',
  },
  {
    heading: 'Five areas, no scolding',
    body: 'A row of five chips across the top fills in as she works: Moving & Growing, Feelings & Friends, How They Learn, Talking & Reading, Thinking & Learning. When one is still grey there is a button that opens the library filtered to it. The app never says invalid, never turns red, and never stops her from printing an incomplete plan.',
  },
  {
    heading: 'Print and post',
    body: 'One page per week, landscape, black on white, 11pt. GELDS code next to every activity. Center, classroom, teacher, week and theme in the header. It is built to carry the components DECAL asks for on a Pre-K plan — 6.5 instructional hours, clock times matching your posted schedule, two daily read-alouds with titles and codes, a daily phonological awareness activity, transitions, outdoor play, small groups, differentiation, planned assessment. The parent copy is the same week with the codes stripped and a friendly line about what the class is learning.',
  },
  {
    heading: 'And when a child changes rooms',
    body: 'The director moves her. The new teacher gets one task: look at the passport. The old teacher gets one task: add anything the next teacher should know. Two taps each. She keeps access for two weeks after the move so she can actually finish it.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-[length:var(--text-display)] font-semibold">How it works</h1>
      <p className="mt-4 text-[length:var(--text-body-lg)] text-text-muted">
        A teacher with a phone in one hand and a toddler in the other. That is who this is designed
        for, and it is the only test that matters.
      </p>
      <div className="mt-10 flex flex-col gap-10">
        {SECTIONS.map((section) => (
          <section key={section.heading} className="flex flex-col gap-3">
            <h2 className="text-[length:var(--text-h1)] font-semibold">{section.heading}</h2>
            <p className="text-[length:var(--text-body-lg)] text-text-muted">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
