# Spec review — before writing feature code

`BUILD-INSTRUCTIONS-claude-code.md` §8.1 asks for this list before any code is
written. These are the things in the three source documents that are wrong,
contradictory, or underspecified enough to cause a rewrite later.

Ordered by how expensive each one gets if it is left alone.

---

## 1. `PROJECT-INSTRUCTIONS.md` §5 and `BUILD-INSTRUCTIONS` §7.2 contradict each other on the word "record"

- §5: _"Frame it to users as **the Child Record** and **the Child Passport**."_
- §7.2: _"Banned words in the UI: … record (as a noun for the object — say
  'child' or 'child's page')."_

One document names the product's second module using a word the other document
bans from the UI. Precedence says PROJECT-INSTRUCTIONS wins, which would make
the copy lint rule wrong.

**What I did:** avoided the collision entirely. The child page has tabs named
Basics / People / Health / Learning / Notes, and `lib/copy.ts` contains no
noun-form "record". The lint rule stands as written.

**What I need from you:** a ruling. If teachers at your center already say "her
record," the ban is the thing that is wrong and should be narrowed to
"records" in the CRM sense. If they don't, keep the ban and we never ship the
phrase. This is a five-minute decision that is expensive to reverse once 300
strings exist.

---

## 2. Part 0 is entirely blank, and one blank in it decides about a third of Phase 0

§9.1 and `BUILD-INSTRUCTIONS` §5 both say offline is mandatory _until_ Part 0.5
confirms reliable wifi, verified by walking the building.

Part 0.5 is empty. So offline is mandatory, T-0.8 is a Phase 0 blocker, and
`tests/e2e/offline.spec.ts` is part of the definition of done. That is a
service worker, an IndexedDB write queue, a conflict store, and a photo upload
queue — a large fraction of the foundation — riding on one unanswered question.

**Recommendation:** answer 0.5 before Phase 0 gets deep. If the wifi is fine at
all three pilot sites, you save weeks. If it isn't, we've lost nothing by
building it first. Either way, guessing is the expensive option.

Also still blank and load-bearing: product pricing (0.2), which the marketing
site currently fills with placeholders behind a `TODO(pricing)` marker.

---

## 3. The `full_code` shape is now expressed in two places and will drift

`FULL_CODE_PATTERN` in `lib/gelds/constants.ts` and the `full_code_shape` CHECK
constraint in migration `0003` say the same thing in two languages. When DECAL
revises the standards, someone will update one and not the other, and the
symptom will be a silently rejected import or — worse — a code that passes the
app and fails the database halfway through a load.

**What I did:** `tests/rls/tenant-isolation.test.ts` now runs the same table of
good and bad codes against the database constraint that
`tests/unit/gelds-code.test.ts` runs against the regex. They must agree or CI
fails. That is the cheapest available guard; it is not the same as having one
source of truth.

---

## 4. `enrollment` needs a `program_start` column that the spec's DDL omits

Every compliance deadline in `BUILD-INSTRUCTIONS` §2.4 is counted from
"program start," but the `enrollment` DDL in that same section has only
`started_on`. Those are not the same date — a child can transfer between rooms
(a new `started_on`) without their program start changing, and if the deadline
clock restarts on a room change the app will fire false alarms at exactly the
families who have already complied.

**What I did:** added `program_start date not null` to `enrollment`.

**Open question for you:** when a child is promoted from Toddler 2 to Pre-K,
does the 3300 clock restart? I have assumed **no** — program start carries
forward. Confirm, because Pre-K has its own 90-day rule and I may be wrong.

---

## 5. `staff.classroom_ids` is an array with no stated maintenance rule

Teacher scoping reads `staff.classroom_ids`. Nothing in any document says who
updates it, when a classroom is soft-deleted, or what happens when a teacher
covers another room for a week. A stale array is a silent access bug in both
directions — a teacher who can't see her own children, or one who can still see
a room she left.

**Recommendation:** the director's staff screen (Phase 4) is the only writer,
and classroom soft-delete must prune the array. Neither is specified. Flagging
now because the RLS policies already depend on it.

---

## 6. The soft-lock nightly job has no runner

§2.5 requires a nightly job setting `locked_at` on rows older than 30 days.
Nothing in the stack (§1) provides a scheduler. Supabase `pg_cron` is the
obvious answer and is not mentioned. It is also a dependency, and §0.2 rule 5
says ask before adding one.

**Asking:** may I enable `pg_cron`? The alternative is a Vercel cron route
holding the service role key, which I like less.

---

## 7. The `TODO(decal-permission)` release gate had nothing to gate

`BUILD-INSTRUCTIONS` §4 says DECAL's written permission for commercial
redistribution must be confirmed before launch and "surface this as a blocking
item, do not let it be forgotten in code review." A blocking item that lives
only in prose gets forgotten.

**What I did:** `scripts/check-release-blockers.mjs` fails a tagged build while
any of five markers survive, and `docs/OPEN-ITEMS.md` carries the markers so
the gate actually fires. Removing a marker is now a deliberate act.

---

## 8. `current_date` in the handoff-window function is server-timezone

`auth_scoped_child_ids()` compares `e.ended_on >= current_date - interval '14
days'`. `current_date` resolves in the database's timezone (UTC), not the
center's. A center in Georgia therefore gets a window that turns over at 7pm or
8pm local rather than midnight.

This is a few hours at the edge of a 14-day window, so I have left it. Noting it
because "the teacher lost access a day early" is the kind of bug that gets
reported as "the app is broken" and takes an afternoon to trace.

---

## 9. Smaller things

- **`--gelds-uncovered` is not in the design brief.** The brief says domain chips
  are "grey when uncovered" but never tokenises that grey. I added the token
  rather than hardcoding a value the hex lint would reject.
- **Marketing prose is exempt from `lib/copy.ts`.** The registry governs product
  UI, where strings are reused and will be translated. Putting a sales
  paragraph in it helps nobody. Documented in the lint script.
- **The design brief's five-page site plus the nav is exactly five pages**
  (Home, How it works, Pricing, Why we built it, Book a demo). No slack for a
  privacy page, which §8 separately requires. That is six. Flagging the
  arithmetic, not arguing with it.
- **Acceptance criteria 3 and 4 both gate launch and neither is code.** The
  field-by-field check against the IQ Guide, and the paid outside reviewer.
  Both need booking now, not at the end of Phase 1.
