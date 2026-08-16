# Early Ed Passport

GELDS-native lesson planner and child page system for Georgia child care centers.

Two products, one database, one login:

- **The lesson planner.** A teacher opens it Friday afternoon, picks next week's
  theme, and in under 15 minutes has a complete weekly plan with the correct
  Georgia GELDS codes attached to every activity, ready to print and post.
- **The child passport.** One page per child that travels with her from the
  Infant room to Toddlers to Pre-K, so the new teacher isn't starting from zero.

**Owner:** Bernard — bernard@truenorth-inc.com

---

## > **Never point a dev machine at production.**

## > **No real child data in staging, ever — seed data only.**

Three Supabase projects: `local` (via `supabase start`), `staging`,
`production`. This app holds children's names, photos, home addresses and health
data. Treat every environment accordingly.

---

## The prime directive

Every screen is read by a person with a phone in one hand and a toddler in the
other, on a five-year-old Android, in a room with bad wifi. **Optimise for her,
not for elegance.** Given a choice between a clever abstraction and an obvious
one, pick obvious.

The one-line test for any screen: _would a teacher tap it without hesitating,
and would a director be comfortable if a state monitor saw it over her
shoulder?_ Both must be yes.

---

## Getting started

```bash
pnpm install
cp .env.example .env.local     # fill it in
pnpm dev
```

Node 20 LTS, pnpm. The stack is fixed and deliberately small — see
`docs/BUILD-INSTRUCTIONS-claude-code.md` §1. **Ask before adding a dependency.**

### The checks that gate every commit

```bash
pnpm lint        # eslint + no hardcoded hex + copy registry rules
pnpm typecheck
pnpm test        # unit + row level security
pnpm build
```

### Running the RLS tests

They need a real Postgres. Without `DATABASE_URL` they **skip**, and a green run
that skipped them proves nothing — CI fails if it detects a skip.

```bash
# any throwaway Postgres will do
export DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
pnpm test:rls
```

---

## The three rules that matter most

**1. Tenant isolation is enforced at the database.** Every business table has a
denormalised `center_id`, RLS enabled _and forced_, and a default-deny posture.
If you write a query that would be wrong without an app-layer filter, the policy
is wrong — fix the policy, not the query. `tests/rls/` is the most important
folder in the repo and Phase 0 does not ship until it is complete and green.

**2. Never invent GELDS data.** If the indicator table isn't loaded, fail
loudly. Do not seed plausible-looking codes. A fabricated standards code on a
monitoring document is a customer-losing event.

**3. Compliance never blocks enrollment.** DECAL prohibits requiring Form 3231
or Form 3300 as a condition of enrollment, and a valid appointment card keeps a
child enrolled past either deadline. There is no code path from a missing
document to a block, and `lib/compliance/rules.ts` exposes no flag that could
become one.

---

## Design tokens

Every value in `DESIGN-BRIEF.md` §2 ships as a CSS custom property in
`app/globals.css`. **No component contains a hardcoded hex** — `pnpm lint:tokens`
fails the build on one.

Two things to know:

- **Red is reserved.** `--critical` is for allergy flags, custody /
  do-not-release flags, and the safety banner. Never for validation, never for a
  network failure. The scarcity is the safety feature: if red appears for a
  blank field, teachers stop registering it on an allergy.
- **The five GELDS domain colours are placeholders.** They carry a
  `TODO(gelds-colors)` marker until the real values are pulled from the GELDS
  Quick Guide PDF. `pnpm lint:release` fails a tagged build while the marker
  survives.

## Copy

All product strings live in `lib/copy.ts` and are enforced by
`pnpm lint:copy`. 6th-grade reading level, no jargon, buttons are verbs a person
would say out loud. Long-form marketing prose under `app/(marketing)` is exempt.

Two strings are required by spec and tested by name:
`learning.notAnAssessment` and `standards.attribution`.

---

## Where things are

```
app/(marketing)      the five-page public site
app/(auth)           login, invite acceptance, password reset
app/(app)            the authenticated product
components/shared    domain chip, coverage bar, empty states
lib/gelds            indicator lookup, code parsing, the AGE_BANDS constant
lib/compliance       per-form deadline rules — the only place 30 and 90 appear
lib/week.ts          week math, single source of truth
lib/copy.ts          every user-facing string
supabase/migrations  numbered SQL, forward-only, never edited once applied
tests/rls            tenant isolation — the most important folder here
tests/e2e            Playwright, including the offline test
docs/                the source specs, the spec review, and Bernard's open items
```

## Current state

Phase 0 foundations. Read `docs/OPEN-ITEMS.md` first — several launch blockers
are not engineering tasks, and `docs/SPEC-REVIEW.md` lists the places the source
specs contradict each other or leave something underspecified.

Standards content © Georgia Department of Early Care and Learning. Attribution
is not endorsement; we are not affiliated with or approved by DECAL.
