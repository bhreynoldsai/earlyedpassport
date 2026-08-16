import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Why we built it' }

export default function WhyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-[length:var(--text-display)] font-semibold">Why we built it</h1>

      <div className="mt-8 flex flex-col gap-6 text-[length:var(--text-body-lg)] text-text-muted">
        <p>
          Every Friday, in child care centers across Georgia, a teacher sits down with a paper
          template and a binder of GELDS standards and tries to match a code to each activity she
          has planned. It takes two hours. She is paid for eight and worked ten. Most weeks the
          codes get written in on Monday morning, or the week before gets photocopied with a new
          date.
        </p>
        <p>
          Then a Pre-K Specialist visits, opens the binder, and scores the plan against the IQ Guide
          for Planning Instruction. The activities were good. The children learned. The plan
          doesn&rsquo;t show it.
        </p>
        <p>
          And every August, children move up a room. What the last teacher knew — that this one
          needs a warning before transitions, that this one&rsquo;s grandmother does pickup on
          Thursdays, how to actually say her name — is passed along in a hallway, if at all.
        </p>
        <p className="text-text">
          Those are two different problems with one thing in common: the knowledge exists, and the
          system loses it. That is all this product does. It keeps the codes attached to the work,
          and it keeps what a teacher knows attached to the child.
        </p>
        <p>
          We are not trying to be your attendance system, your billing system, or your parent
          messaging app. Other companies do those well. We are trying to do the two things they do
          badly.
        </p>
      </div>
    </div>
  )
}
