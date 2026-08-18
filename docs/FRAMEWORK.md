# The Compass — our developmental framework

Bernard, 2026-08-18: "I want to take everything that we downloaded from
DECAL and GELDS, and I want to create our own specific products for this
website and for the clients. Get creative, take what you have, be
innovative, and even add more. Think about what you would want if you are a
child, a child care teacher, or director."

This is that. Below is the framework itself, the reasoning behind its
shape, and what's still ahead of it.

---

## What replaces what

| GELDS (retired)                                                                                                         | The Compass (ours)                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 5 domains, one (Cognitive Development) split into 5 subdomains — 6 effective categories at two different nesting depths | 6 Pathways, all at the same level — no special case                                                 |
| Domain → Strand → Standard → Indicator (4 levels)                                                                       | Pathway → Milestone Group → Skill Marker (3 levels)                                                 |
| `indicator_text` (verbatim, legally frozen) + `plain_text` (a paraphrase, written later as a separate content task)     | One `skill_text`, written in plain language from the start — there's nothing else to paraphrase     |
| Age band packed into the code string (`PDM6.3b`)                                                                        | Age band is its own column; the code (`GS-3.4`) only says which Pathway and which Milestone Group   |
| Activities are a separate free HTML library DECAL owns, with no materials field, no family component                    | Activities are ours: structured materials list, a "Take it home" line, a "Grown-up tip" — see below |

None of this content is copied or paraphrased from any state standards
document. The old GELDS reference data (`supabase/gelds/`,
`docs/reference/gelds/`) is kept in the repo for historical/legal reference
only — it is not used to generate anything below, and `lib/gelds/` still
exists but nothing calls it anymore.

## Why 6 Pathways, not 5

GELDS folds creativity — art, music, pretend play — into a subdomain of
Cognitive Development. We didn't like that. A four-year-old inventing a
pretend rocket ship out of a cardboard box is not a footnote to cognitive
development; it's its own kind of growth, and it deserves top-level billing.
**Wonder & Make** is the one Pathway with no GELDS equivalent — everything
else maps loosely onto ground GELDS also covered, because child development
doesn't change based on who's naming it, but this one is a deliberate
addition.

## The six Pathways

| Code | Pathway                        | Covers                                                                              |
| ---- | ------------------------------ | ----------------------------------------------------------------------------------- |
| CM   | **Curious Mind**               | Thinking, noticing, and figuring things out — early math, science, problem-solving. |
| GS   | **Growing Strong**             | Moving, using hands and tools, and everyday self-care.                              |
| FW   | **Finding Words**              | Listening, talking, and falling in love with stories.                               |
| BF   | **Big Feelings, Good Friends** | Knowing yourself, calming down, and getting along.                                  |
| TD   | **Trying & Doing**             | Giving things a try and sticking with what is hard.                                 |
| WM   | **Wonder & Make**              | Making, pretending, and expressing ideas.                                           |

Full pathway descriptions, all 18 Milestone Groups, and the ~90-marker
starter set live in `lib/framework/seed-data.ts` (structured, for the
database) — the same content is below in narrative form for anyone reading
this doc instead of the code.

### Curious Mind (CM)

The Curious Mind pathway follows how your child explores, questions, and
figures things out — from a baby who shakes a rattle just to hear it rattle
again, to a five-year-old who can guess what will happen next and explain
why. Curiosity is the engine behind every subject a child will ever study.

Milestone Groups: **Cause and Effect Detectives**, **Sorting, Patterns &
Numbers**, **Big Questions**.

### Growing Strong (GS)

Growing Strong follows your child's journey with their own body — from the
first wobbly head lifts to running full-speed across the playground, and
from grabbing a rattle to zipping up a jacket. Strong, confident bodies help
children explore, play, and take on new challenges with joy.

Milestone Groups: **Big Body Moves**, **Clever Hands**, **Taking Care of
Me**.

### Finding Words (FW)

Finding Words is about how a child grows from a cooing baby into a
confident talker and story-lover — from a six-month-old turning toward a
familiar voice, to a four-year-old retelling their favorite story in their
own words. Language is how children connect: it's the tool they'll use to
ask for a hug, make a friend, solve a problem, and one day walk into a
kindergarten classroom ready to learn.

Milestone Groups: **Tuning In**, **My Words, My Voice**, **Books and Big
Ideas**.

_A note on home language, carried into the content itself: growing up
hearing more than one language is a strength, not something to correct, and
activity guidance in this pathway says so directly rather than assuming
English is the default._

### Big Feelings, Good Friends (BF)

Big feelings show up everywhere in early childhood — the joyful shriek
before nap, the meltdown over the wrong color cup, the shy hand reaching for
a caregiver's leg on a new day. A child who feels safe, seen, and capable of
managing their own storms is a child who is ready to learn, play, and grow.

Milestone Groups: **Me, Myself, and I**, **Steady and Strong**, **Friends
and Neighbors**.

### Trying & Doing (TD)

Trying & Doing follows how a child leans into the world — noticing
something interesting, having a go at it, and sticking with it even when
it's tricky. This isn't about whether a child gets the right answer; it's
about _how_ they approach a challenge. These are the habits that carry a
child through kindergarten and every classroom after it.

Milestone Groups: **Curious Sparks**, **The Long Haul**, **My Own Two
Hands**.

### Wonder & Make (WM)

Wonder & Make is where a child turns "what if" into something real — a
splash of paint, a pretend rocket ship, a made-up song banged out on a pot
lid. Imagination isn't a break from learning — it's how young children
think, problem-solve, and make sense of their world.

Milestone Groups: **Marks & Materials**, **Pretend Worlds**, **Rhythm &
Motion**.

---

## What we added beyond parity

The brief was "even add more" — five real product ideas came out of
writing this content, in addition to the sixth Pathway above. Items 1–3
came directly out of writing the framework itself. Item 4 came from a round
of web research into what child care teachers and directors actually
struggle with day to day (sources below it). Item 5 came from a second
research note Bernard passed along directly.

1. **Richer activities than any state library offers.** DECAL's activity
   library (`docs/reference/gelds-activity-library.md`) has a title, an age
   group, a domain/indicator tag, and one prose paragraph — materials are
   buried in the description, and there's nothing for a family. Every
   Compass activity has a structured materials list, a **Try This**
   (teacher-facing how-to), a **Take It Home** line (a family extension —
   this is the one that pays off the "passport that follows the child" idea
   literally, not just in the child's file but in what the family does that
   evening), and a **Grown-up Tip** (one encouraging, non-clinical line —
   what to watch for, how to adapt it, permission to not force it).

2. **Passport Stamps.** Not built yet — this depends on the lesson-plan
   builder (T-1.1), which doesn't exist yet either — but it's the natural
   next feature once a teacher can mark an activity done against a tagged
   Skill Marker. Each Pathway gets a **stamp** in the child's passport the
   first time a real, logged activity covers it; enough stamps in a Pathway
   unlocks a small milestone badge (e.g. "Curious Mind — Explorer"). This
   turns the coverage bar every director already wants into something a
   _child_ wants too, and pays off "passport" as more than a file format —
   it's the one thing GELDS-based competitors structurally can't do, because
   the passport metaphor was never theirs to begin with.

3. **A director's coverage story, not just a checklist.** The old
   `coverage-bar` component (`components/shared/coverage-bar.tsx`) shows
   which of six Pathways a week's plan touches — useful, but it reads like
   an audit. Once Skill Markers are wired into real plans, the same data can
   generate one plain-English sentence for a family newsletter or a
   licensing visit — "This week, the Sunshine Room worked on sorting and
   counting, tried a new obstacle course, and read three books together" —
   built from whichever Skill Markers were actually tagged, no extra data
   entry. Not built yet; flagged here so it isn't lost.

4. **An "in the moment" tool, not just a planning tool.** Research into
   daily teacher pain points (below) found that 63% of teachers name
   classroom behavior management as their #1 daily challenge — bigger than
   documentation, bigger than planning time. Nothing in this product today
   helps a teacher in the actual moment a child is dysregulated; the
   **Big Feelings, Good Friends → Steady and Strong** Milestone Group and
   the Calm-Down Cove starter activity are planning-time content, not a
   10-second lookup a teacher can use mid-meltdown. A short, printable or
   phone-quick "what to try right now" card per common scenario (a child
   who won't transition, a child who's hit someone, a child melting down at
   drop-off) would be a genuinely different kind of feature than anything
   else in the roadmap — most competitors are planning tools, not
   moment-of tools. Not built, not scoped — flagged as a real idea worth
   deciding on, not a commitment.

   **Related, director-side:** research also surfaced that inspection-day
   stress is less about any single requirement and more about records being
   scattered across folders and systems, costing directors hours hunting
   for paperwork before a licensing visit. The product already tracks
   compliance forms (Form 3231/3300) per child, but "everything organized
   in one place for an inspection" isn't currently a stated selling point
   anywhere in the marketing copy or the roadmap — worth considering as a
   positioning angle even before any new engineering.

   Sources: [Illumine, Top Challenges Preschool Teachers Face](https://illumine.app/blog/common-problems-faced-by-preschool-teachers) ·
   [The Australian Educational Researcher, workload demands survey](https://link.springer.com/article/10.1007/s13384-025-00847-z) ·
   [ChildPilot, Childcare Staffing Challenges](https://childpilot.com/blog/childcare-staffing-challenges/) ·
   [1Core Solution, Childcare Compliance Management](https://1coresolution.com/blog/how-childcare-centers-can-manage-compliance) ·
   [Edutopia, Have Teachers Reached App Overload?](https://www.edutopia.org/article/technology-integration/)

5. **Quick Swap, not just a plan.** Bernard passed along a second research
   note ([`docs/reference/child_care_lesson_plan_challenges.md`](reference/child_care_lesson_plan_challenges.md))
   that names something the first round didn't: "a meticulously designed
   lesson plan rarely survives
   contact with the classroom" — kids are overstimulated, tired, or just not
   into it, and a teacher has to improvise on the spot. A plan built once a
   week and printed doesn't help at 10am when it's already not working.
   Because every activity is tagged to a Skill Marker rather than living in
   isolation, the natural feature is a **swap**: at any point in the day, pull
   up other activities tagged to the same Skill Marker or Pathway and
   substitute one in — the coverage story stays accurate without re-planning
   anything. Not built, needs the lesson-plan builder first, same as items
   2–4.

   **Two things this same note validates rather than adds:** the
   "One-Size-Fits-None" problem (children at wildly different developmental
   points in one room) is already why every Compass activity is written with
   the `differentiation` / `forMoreSupport` / `forMoreChallenge` fields
   already in `lib/copy.ts`'s `activity` section, and why age bands are
   ranges an activity can span rather than a single value — see "Sink or
   Float Lab" (36–60 months) in `docs/reference/compass-starter-activities.md`.
   And "Resource and Supply Gaps" (teachers buying craft supplies out of
   pocket) is why every content-drafting brief for this framework explicitly
   asked for materials that are cheap and already sitting in a classroom —
   worth keeping as a hard rule for whoever writes the next 280 activities,
   not just a nice-to-have.

   **One tension worth naming, not solving here:** the same note describes
   real pressure on teachers to introduce academic, worksheet-style content
   younger than developmental best practice recommends. The Compass is built
   entirely around play-based, observable skills — which means a teacher
   using it has something concrete to point to ("here's the sorting and
   counting skill this activity actually covers") when defending play-based
   practice against that pressure, without needing to add a worksheet to
   prove it. Worth considering as a positioning line, not an engineering
   task.

## What's still ahead (see docs/OPEN-ITEMS.md)

- **This is a starter set, not a finished library.** ~90 Skill Markers and
  12 sample activities across six Pathways is enough to seed a real
  database and demo the product end to end. `docs/OPEN-ITEMS.md` already
  budgeted "300 seeded activities" as a real content-writing task, not an
  engineering one — that line item now points here instead of at GELDS.
- **The migration (`0007_compass_reference.sql`) adds `compass_*` tables
  without touching `gelds_*`.** Nothing in the app reads `gelds_indicator`
  today — the lesson-plan builder that would have doesn't exist yet — so
  dropping the old tables is low-risk but still a deliberate, separate step,
  not bundled into this one.
- **`lib/gelds/`, the GELDS import pipeline, and the ~50 remaining
  GELDS-referencing files** (tests, CI config, docs) are still in the repo.
  They're inert, not wired into anything live, but cleaning them out is its
  own pass rather than something to rush alongside writing new content.
- **The migration has not been applied to the live database yet.** It needs
  `supabase db push` (or the Supabase MCP connector, once it's stable in
  this session) before `pnpm framework:load` has anywhere to write.
