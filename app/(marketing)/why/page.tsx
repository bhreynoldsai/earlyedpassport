import type { Metadata } from 'next'
import { ClassicalButton } from '@/components/marketing/classical-button'

export const metadata: Metadata = { title: 'Why we built it' }

export default function WhyPage() {
  return (
    <>
      <div
        style={{
          background:
            'linear-gradient(180deg, var(--color-classical-accent-100), var(--color-classical-bg) 70%)',
        }}
      >
        <section className="mx-auto max-w-[760px] px-6 py-16 md:py-20">
          <p className="mb-3 text-xs tracking-[0.1em] text-classical-accent-700 uppercase">
            Why we built it
          </p>
          <h1 className="font-normal text-[clamp(30px,4vw,44px)] leading-[1.1]">Why we built it</h1>
        </section>
      </div>

      <section className="mx-auto flex max-w-[760px] flex-col gap-5 px-6 py-12">
        <p className="text-justify text-[17px] leading-[1.7]">
          Every Friday, in child care centers across Georgia, a teacher sits down with a paper
          template and a binder of standards and tries to match the right tag to each activity she
          has planned. It takes two hours. She is paid for eight and worked ten. Most weeks the tags
          get written in on Monday morning, or the week before gets photocopied with a new date.
        </p>
        <p className="text-justify text-[17px] leading-[1.7]">
          Then a program specialist visits, opens the binder, and scores the plan against the
          monitoring checklist. The activities were good. The children learned. The plan
          doesn&rsquo;t show it.
        </p>
        <p className="text-justify text-[17px] leading-[1.7]">
          And every August, children move up a room. What the last teacher knew — that this one
          needs a warning before transitions, that this one&rsquo;s grandmother does pickup on
          Thursdays, how to actually say her name — is passed along in a hallway, if at all.
        </p>
        <div className="my-2 border-l-2 border-classical-accent pl-4">
          <p className="font-classical-heading text-[23px] leading-[1.4] font-normal">
            Those are two different problems with one thing in common: the knowledge exists, and the
            system loses it. That is all this product does.
          </p>
        </div>
        <p className="text-justify text-[17px] leading-[1.7]">
          It keeps the tags attached to the work, and it keeps what a teacher knows attached to the
          child.
        </p>
        <p className="text-justify text-[17px] leading-[1.7]">
          We are not trying to be your attendance system, your billing system, or your parent
          messaging app. Other companies do those well. We are trying to do the two things they do
          badly.
        </p>
        <ClassicalButton href="/demo" className="mt-4 self-start">
          Book a demo
        </ClassicalButton>
      </section>
    </>
  )
}
