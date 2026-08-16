# Build Instructions — for Claude Code

**Read `PROJECT-INSTRUCTIONS.md` first. It is the source of truth for _what_ and _why_. This file is _how_.**
If the two ever conflict, PROJECT-INSTRUCTIONS.md wins — stop and flag the conflict rather than guessing.

**Product:** GELDS-native lesson planner + child record system for Georgia child care centers.
**Owner:** Bernard — bernard@truenorth-inc.com
**Mode:** Foundations first, then Phase 1. No feature code before Phase 0 is green.

---

## 0. HOW TO WORK ON THIS PROJECT

### 0.1 The prime directive

Every line of this product is read by a person with a phone in one hand and a toddler in the other. **Optimize for her, not for elegance.** When you have a choice between a clever abstraction and an obvious one, pick obvious.

### 0.2 Working rules

1. **Work ticket by ticket.** Tickets are in §6. Do one, make it green, commit, move on. Do not start three at once.
2. **Every ticket ends with tests passing and the app running.** Never leave `main` broken.
3. **Write the test that proves the security boundary before the feature.** Multi-tenant leaks are the one bug class that kills this company.
4. **Never invent GELDS data.** If the indicator table isn't loaded, the correct action is to fail loudly, not to seed plausible-looking codes. Fabricated standards codes on a monitoring document is a customer-losing event.
5. **Ask before adding a dependency.** The stack in §1 is deliberately small.
6. **Ask before changing the schema** once Phase 0 ships. Migrations only, never edits to existing migration files.
7. **Do not build anything in the "Do not build" list (§7.4).** Not even behind a flag.
8. **Commit messages:** `[ticket-id] imperative summary`. One logical change per commit.

### 0.3 What "done" means

A ticket is done when all of these are true:

- [ ] Feature works on a 375px-wide viewport, one-handed, without horizontal scroll
- [ ] Autosaves — no data loss if the tab closes mid-edit
- [ ] Works with the network throttled to Slow 3G, and offline if the ticket says so
- [ ] RLS test proves a user from Center A cannot read or write Center B's row **via the API directly**, not just the UI
- [ ] All user-visible copy is 6th-grade reading level, no jargon (§7.2)
- [ ] No red error states — soft, actionable, yellow (§7.3)
- [ ] Keyboard accessible, visible focus rings, 4.5:1 contrast minimum
- [ ] Unit tests for logic, one integration test for the happy path
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build` all pass

---

## 1. STACK — FIXED, DO NOT SUBSTITUTE

| Layer                     | Choice                                                                     | Why                                                                           |
| ------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Framework                 | **Next.js (App Router) + TypeScript, strict**                              | Server components for the print/PDF path, one deployable                      |
| Styling                   | **Tailwind CSS** + CSS custom properties for design tokens                 | Tokens come from the design brief; do not hardcode hex values                 |
| UI primitives             | **shadcn/ui** (Radix under the hood)                                       | Accessible by default; we restyle, we don't rebuild                           |
| Database / Auth / Storage | **Supabase** (Postgres 15+, GoTrue, Storage)                               | RLS gives tenant isolation _at the database_, which is the whole ballgame     |
| Data access               | **Supabase JS client** + generated types (`supabase gen types typescript`) | No ORM. No Prisma. RLS is the security model and an ORM tempts you around it. |
| Offline                   | **PWA**: service worker + IndexedDB write queue (`idb` library)            | Required. See §5.                                                             |
| Forms                     | **react-hook-form** + **zod**                                              | One schema validates client and server                                        |
| PDF                       | **@react-pdf/renderer** OR headless-Chrome print of a `/print` route       | Decide in T-1.9; same React source as screen either way                       |
| Dates                     | **date-fns**, all dates stored UTC, rendered in the center's timezone      | Week boundaries are a real bug source; centralize in `lib/week.ts`            |
| Testing                   | **Vitest** (unit), **Playwright** (E2E, including the offline test)        |                                                                               |
| Payments                  | **Stripe** — Phase 4 only. Do not scaffold it early.                       |                                                                               |
| Hosting                   | **Vercel** + Supabase cloud                                                |                                                                               |

**Package manager:** pnpm. **Node:** 20 LTS.

### 1.1 Repo layout

```
/app                       Next.js App Router
  /(marketing)             public site — see DESIGN-BRIEF.md §8
  /(auth)                  login, invite acceptance, password reset
  /(app)                   authenticated product
    /r/[classroomId]       roster (teacher home)
    /plan/[classroomId]/[weekStart]   the lesson planner
    /child/[childId]       child record (tabbed)
    /director              dashboard, compliance, staff
    /print/...             print-only routes, no chrome
/components
  /ui                      shadcn primitives, restyled
  /planner                 week grid, plan slot, indicator chooser
  /child                   roster tile, record tabs, passport
  /shared                  domain chip, coverage bar, empty states
/lib
  /supabase                client, server, middleware, generated types
  /gelds                   indicator lookup, suggestion, code formatting
  /offline                 write queue, sync engine, conflict policy
  /compliance              deadline rules per doc_type — see §2.4
  /week.ts                 week math — single source of truth
  /copy.ts                 ALL user-facing strings (see §7.2)
/supabase
  /migrations              numbered SQL, forward-only
  /seed                    demo center, demo classroom, demo children
  /gelds                   the GELDS import pipeline and its output
/tests
  /rls                     tenant isolation tests — the most important folder
  /e2e                     Playwright
```

### 1.2 Environments

Three Supabase projects: `local` (via `supabase start`), `staging`, `production`. **Never point a dev machine at production.** No real child data in staging, ever — seed data only. Put that rule in the README in bold.

---

## 2. DATA MODEL — BUILD THIS EXACTLY

Full conceptual model is in PROJECT-INSTRUCTIONS.md §6. Implementation notes that override or extend it:

### 2.1 Universal column contract

Every business table gets:

```sql
id            uuid primary key default gen_random_uuid(),
center_id     uuid not null references center(id) on delete restrict,
created_at    timestamptz not null default now(),
updated_at    timestamptz not null default now(),
created_by    uuid references app_user(id),
deleted_at    timestamptz              -- soft delete; NULL = live
```

- `center_id` is **not null on every business table**, including deeply nested ones. Denormalize it. Yes, even though it's derivable. It makes every RLS policy a single indexed comparison instead of a join, and joins in RLS policies are where tenant leaks hide.
- Index `(center_id, deleted_at)` on every table.
- Never `DELETE`. Set `deleted_at`. Add a `WHERE deleted_at IS NULL` clause to every RLS `USING` expression so soft-deleted rows are invisible by default.

### 2.2 Reference tables (GELDS) — the exception

`gelds_domain`, `gelds_strand`, `gelds_standard`, `gelds_indicator` have **no `center_id`**. They are global, read-only to all authenticated users, and writable only by the service role.

```sql
create table gelds_indicator (
  id             uuid primary key default gen_random_uuid(),
  gelds_version  text not null,              -- e.g. '2013-rev-2024'
  domain_code    text not null,              -- PDM | SED | APL | CLL | CD
  subdomain_code text,                       -- CD ONLY: MA | SC | SS | CR | CP. NULL for the other four domains.
  strand_id      uuid references gelds_strand(id),
  standard_number int not null,              -- the 6 in PDM6.3b, the 1 in CD-MA1.4a
  age_band       int not null check (age_band between 0 and 4),
  indicator_letter text,                     -- a..f, nullable when a standard has one indicator at an age
  full_code      text not null,              -- 'PDM6.3b' / 'CD-MA1.4a' — generated, not hand-entered
  constraint subdomain_only_on_cd check (
    (domain_code = 'CD' and subdomain_code is not null)
    or (domain_code <> 'CD' and subdomain_code is null)
  ),
  indicator_text text not null,              -- verbatim DECAL text
  plain_text     text,                       -- our 6th-grade paraphrase for the chooser
  search_vector  tsvector,
  unique (gelds_version, full_code)
);
create index on gelds_indicator using gin (search_vector);
```

**Rules:**
**CD is not a flat domain.** Read PROJECT-INSTRUCTIONS.md §3.1a before touching this table. Cognitive Development carries a subdomain segment _inside the code_: `CD-MA1.4a` (Math), `CD-SC` (Science), `CD-SS` (Social Studies), `CD-CR` (Creative), `CD-CP` (Cognitive Processes). The other four domains have no such segment. Two code shapes, one column. Coverage checking still counts **five domains** — covering `CD-MA` covers CD.

- `full_code` is computed by the importer, never typed by a human.
- `indicator_text` is DECAL's verbatim wording and is **never edited**. `plain_text` is ours and is what the chooser shows large; `indicator_text` shows on hover/expand; `full_code` shows small and grey. All three visible somewhere.
- Age band mapping: `0`=0–12mo, `1`=12–24mo, `2`=24–36mo, `3`=36–48mo, `4`=48–60mo. Put this in one constant, `AGE_BANDS`, in `lib/gelds`.
- Every `activity_indicator` and `observation_indicator` row stores **both** `gelds_indicator_id` **and** a denormalized `full_code` + `gelds_version` snapshot. When DECAL revises the standards, a plan printed in 2027 must still show what it showed in 2027.

### 2.3 Enrollment is history, not a field

```sql
create table enrollment (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references center(id),
  child_id uuid not null references child(id),
  classroom_id uuid not null references classroom(id),
  started_on date not null,
  ended_on date,                    -- NULL = current
  ended_reason text,                -- 'promoted' | 'withdrawn' | 'transferred'
  ...
);
```

There is **no `classroom_id` column on `child`.** Current classroom is a view:

```sql
create view child_current_classroom as
  select distinct on (child_id) child_id, classroom_id, started_on
  from enrollment
  where ended_on is null and deleted_at is null
  order by child_id, started_on desc;
```

Every code path that wants "what room is Maya in" goes through this view. If you find yourself wanting to cache it on `child`, don't.

### 2.4 Compliance documents — the rule that will bite you

```sql
create type compliance_status as enum ('missing','appointment_card','on_file','expired');

create table compliance_doc (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null,
  child_id uuid not null references child(id),
  doc_type text not null,           -- 'form_3231' | 'form_3300' | ...
  status compliance_status not null default 'missing',
  issued_on date,
  screened_on date,                 -- 3300 only: when screenings were performed
  expires_on date,
  due_on date not null,             -- computed at enrollment, see below
  file_path text,                   -- Supabase Storage
  ...
);
```

**Deadlines are different per form. Do not write one countdown.**

| Form                                        | Deadline                                | Extra rule                                                                                                                                         |
| ------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `form_3231` Certificate of Immunization     | **30 calendar days** from program start | Must be replaced within 30 days after expiration                                                                                                   |
| `form_3300` Vision/Hearing/Dental/Nutrition | **90 calendar days** from program start | Screenings must have been performed **within the 12 months before** program start — validate `screened_on >= program_start - interval '12 months'` |

Encode this in `lib/compliance/rules.ts` as a table, one entry per `doc_type`, with `dueDays` and an optional `validate()`. Never inline `30` anywhere.

**HARD RULE — enrollment is never blocked.** DECAL prohibits requiring either form as a condition of enrollment, and a valid appointment card keeps a child enrolled past either deadline. Therefore:

- There is **no code path** in which a missing or expired compliance doc prevents creating an enrollment, showing a child on a roster, or saving any record.
- Compliance state is **display and reminder only**.
- Write a test named `enrollment_never_blocked_by_missing_forms` that creates a child with zero docs, enrolls them, and asserts they appear on the roster. This test is load-bearing; do not delete it if it becomes inconvenient.

### 2.5 Soft-lock on evidence

`lesson_plan` and `observation` get `locked_at timestamptz`. A nightly job sets `locked_at = now()` on rows older than 30 days. Locked rows reject `UPDATE` at the RLS level except for users with role `director` or `org_admin`, who can unlock (which writes an audit row). These are compliance evidence; silent retroactive edits destroy their value.

### 2.6 Audit log

```sql
create table audit_log (
  id bigserial primary key,
  center_id uuid not null,
  actor_id uuid,
  action text not null,          -- 'view' | 'create' | 'update' | 'delete' | 'unlock' | 'download'
  entity_type text not null,
  entity_id uuid,
  detail jsonb,
  occurred_at timestamptz not null default now()
);
```

Write an audit row on: any read of a child health record, any change to health data, any document download, any delete, any unlock, any permission change. Append-only — no RLS `UPDATE` or `DELETE` policy exists for this table at all.

---

## 3. ROW-LEVEL SECURITY — THE MOST IMPORTANT SECTION

### 3.1 The model

- Every table: `alter table X enable row level security;` **and** `alter table X force row level security;` (the second one matters — without it the table owner bypasses policies).
- No table is reachable without a policy. Default deny.
- Authorization data lives in `staff (user_id, center_id, role, classroom_ids uuid[])`.
- Use a `security definer` helper so policies stay one-liners:

```sql
create or replace function auth_centers()
returns setof uuid language sql stable security definer set search_path = public as $$
  select center_id from staff
  where user_id = auth.uid() and deleted_at is null;
$$;

create or replace function auth_role(c uuid)
returns text language sql stable security definer set search_path = public as $$
  select role from staff
  where user_id = auth.uid() and center_id = c and deleted_at is null
  limit 1;
$$;
```

Then, on every business table:

```sql
create policy tenant_read on child for select
  using (center_id in (select auth_centers()) and deleted_at is null);
```

### 3.2 Role matrix

Implement exactly the four roles in PROJECT-INSTRUCTIONS.md §7 — `teacher`, `lead_teacher`, `director`, `org_admin`. **Do not add a fifth role. Do not build custom permissions.** Notable specifics:

- `teacher` and `lead_teacher` see children currently enrolled in their assigned classrooms (join through `child_current_classroom`), **plus children whose enrollment in one of their classrooms ended within the last 14 days.** That grace window exists so the previous teacher can complete the passport sign-off the promotion flow assigns her (T-3.7); without it, promotion locks her out of her own task. Write an RLS test named `previous_teacher_retains_access_during_handoff`.
- **All four roles can see allergies and health flags** for children in their rooms — this is a safety requirement, not a privilege.
- Only `lead_teacher`+ can _edit_ health data.
- Only `director`+ can read `child_document` rows of type `custody_order` or `iep`. Enforce in the policy, not in the query.

### 3.3 Testing it — `/tests/rls`

For every table, four tests, run against a real local Postgres with two seeded centers:

1. User in Center A **can** read their own row
2. User in Center A **cannot** read Center B's row
3. User in Center A **cannot** write to Center B's row
4. Anonymous **cannot** read anything

Additionally: a `teacher` in Classroom 1 cannot read a child in Classroom 2 of the same center. And a test that hits the **PostgREST endpoint directly with a forged `center_id` filter**, not the app's data layer — the UI proves nothing.

**Phase 0 does not ship until `/tests/rls` is complete and green.**

---

## 4. THE GELDS IMPORT PIPELINE (T-0.6)

Build as a standalone, re-runnable script in `/supabase/gelds`.

1. **Source** the standards from https://gelds.decal.ga.gov/GELDS and the PDF exports (GELDS Quick Guide, GELDS Standards for Age Ranges).
2. **Parse** to an intermediate `gelds-<version>.json` that is **committed to the repo**. The parse step is fragile and should run rarely; the JSON is the artifact everything else depends on.
3. **Validate before insert.**

   **Hard gates — fail the whole import:**
   - Every `full_code` matches:
     ```
     /^(?:(PDM|SED|APL|CLL)|CD-(MA|SC|SS|CR|CP))([1-9]\d?)\.([0-4])([a-f])?$/
     ```
     Note: bounded standard number (`[1-9]\d?`) so a parser bug producing `PDM0.3b` or `PDM06.3b` is caught rather than stored. Uppercase only — no `i` flag.
   - No duplicate `full_code` within a version
   - All five domains present, and all five CD subdomains present
   - `subdomain_code` non-null iff `domain_code = 'CD'`

   **Soft gates — report, don't fail, on the first import of a version:**
   - Domain × age-band coverage matrix. Print it; a human eyeballs it. It becomes a hard gate only once a baseline is recorded, because no one has verified that every domain has an indicator at every band.
   - Total indicator count within 10% of the previous version (catches a silently truncated parse). **Skipped when there is no prior version.**

4. **Load** with the service role into `gelds_indicator`, tagged with `gelds_version`.
5. **Never** let application code write to these tables.

**Attribution:** render "Standards content © Georgia Department of Early Care and Learning" in the app footer and on every printed lesson plan. **Bernard must confirm DECAL's written permission for commercial redistribution before launch** — surface this as a blocking item, do not let it be forgotten in code review.

**`plain_text` paraphrases** are human-written content, not generated at import time. Ship v1 with `plain_text` nullable and fall back to `indicator_text`; the paraphrase pass is a content task, not an engineering one.

---

## 5. OFFLINE — BUILD IT IN PHASE 0, NOT LATER

**Conditionality:** PROJECT-INSTRUCTIONS.md §9.1 allows dropping offline if Part 0.5 confirms reliable wifi at every pilot site, _verified by walking the building_. Until Bernard fills in Part 0.5 and that verification happens, **offline is mandatory and T-0.8 is a Phase 0 blocker.** Do not descope it on your own judgment.

Retrofitting offline is a rewrite. The two flows that must survive a dead wifi router:

- **Recording an observation** (the 30-second flow, including the photo)
- **Editing a lesson plan**

### 5.1 Approach

- Service worker caches the app shell and the GELDS indicator table for the user's classroom age bands.
- All writes go through `lib/offline/queue.ts`: write to IndexedDB first, optimistically update the UI, then attempt the network. On failure, retry with backoff when `online` fires.
- Photos: store the blob in IndexedDB, upload on reconnect, swap the local object URL for the storage path.
- **Conflict policy: last-write-wins per field, and never silently discard.** If a queued write loses, keep the losing version in a `conflicts` store and show a soft banner: "We saved a second copy of this note. Tap to compare." Do not show a merge UI to a teacher.
- Show a single quiet status chip: `Saved` / `Saving…` / `Saved on this phone — will sync`. Never the word "sync" alone, never an error.

### 5.2 The test that proves it

Playwright, in `/tests/e2e/offline.spec.ts`:

1. Load the roster online
2. `context.setOffline(true)`
3. Record an observation with a photo and two indicators
4. Build a full 5-day lesson plan
5. Reload the page (still offline) — **both must still be there**
6. `context.setOffline(false)`
7. Assert both landed in Postgres with correct `center_id` and indicator links

This test is part of Phase 0's definition of done, even though the features it exercises don't exist yet — write it against stubs and let the Phase 1/3 tickets turn it green.

---

## 6. TICKETS

Do them in order. Do not skip ahead. `→` marks a ticket that unblocks a lot; give it extra care.

### Phase 0 — Foundations (no user-visible features)

| ID     | Ticket                                                                                                                                                                                                                                                                                                          | Done when                                                                  |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| T-0.1  | Repo, pnpm, TS strict, Tailwind, shadcn, lint/format, CI running lint+typecheck+test+build                                                                                                                                                                                                                      | CI green on an empty app                                                   |
| T-0.2  | Supabase local + staging; migration workflow; generated types wired into CI                                                                                                                                                                                                                                     | `supabase db reset` reproduces the schema from zero                        |
| T-0.3  | → Core schema: org, center, classroom, child, enrollment, staff, app_user                                                                                                                                                                                                                                       | Migration applies clean; `child_current_classroom` view works              |
| T-0.4  | → RLS policies + `auth_centers()` / `auth_role()` helpers on all Phase 0 tables                                                                                                                                                                                                                                 | `/tests/rls` complete and green                                            |
| T-0.5  | Auth: email+password, invite-by-email for staff, password reset, session middleware                                                                                                                                                                                                                             | A director can invite a teacher who can log in and see only her rooms      |
| T-0.6  | → GELDS import pipeline + validation + load                                                                                                                                                                                                                                                                     | All five domains, all age bands, validation gates enforced                 |
| T-0.7  | Design tokens from DESIGN-BRIEF.md §2 as CSS custom properties + Tailwind theme. The five `--gelds-*` domain colors are **not yet known** — ship documented placeholders with a `TODO(gelds-colors)` marker and a CI grep that fails the build once a release tag is applied while the marker is still present. | No hardcoded hex in any component; placeholder markers present and tracked |
| T-0.8  | → Offline queue + service worker + status chip; `offline.spec.ts` written against stubs                                                                                                                                                                                                                         | Test exists and fails only on unbuilt features                             |
| T-0.9  | `lib/copy.ts` string registry + a CI check that fails on user-facing string literals in JSX                                                                                                                                                                                                                     | Lint rule active                                                           |
| T-0.10 | Audit log table, append-only policy, `audit()` helper                                                                                                                                                                                                                                                           | Writing a health field produces an audit row                               |
| T-0.11 | Seed script: 1 demo center, 3 classrooms across age bands, 12 demo children, 2 weeks of plans                                                                                                                                                                                                                   | `pnpm seed` gives a working demo in under 30s                              |

**Phase 0 exit gate:** every RLS test green, offline harness in place, GELDS data loaded and validated, seed demo works. Do not proceed otherwise.

### Phase 1 — Lesson Planner (the wedge)

| ID     | Ticket                                                                                                                                                                                                                                                                                                        | Done when                                                                                                                          |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| T-1.1  | `lesson_plan`, `plan_slot`, `activity`, `activity_indicator`, `activity_template` schema + RLS + tests                                                                                                                                                                                                        | RLS tests green                                                                                                                    |
| T-1.2  | `lib/week.ts` — week start/end, timezone handling, "next week" resolution                                                                                                                                                                                                                                     | Unit tests across DST boundaries                                                                                                   |
| T-1.3  | Routine-row templates per age band; classroom-level override                                                                                                                                                                                                                                                  | Infant room and Pre-K room show different rows with zero configuration                                                             |
| T-1.4  | → Week grid UI, mobile-first (one day column at a time on phone, full grid on tablet+)                                                                                                                                                                                                                        | Usable one-handed at 375px                                                                                                         |
| T-1.5  | Activity editor sheet — title, what you do, materials, differentiation                                                                                                                                                                                                                                        | Autosaves on every keystroke, debounced                                                                                            |
| T-1.6  | → **Indicator chooser.** Three tabs: Suggested (default, pre-checked) / By area / Search. Plain text large, code small and grey. Age-band filtered with "show nearby ages" toggle. Soft nudge above ~6. **"By area" is five domain tiles where CD expands to a second level of five subdomain tiles** (§2.2). | A teacher can attach indicators without typing a code; Suggested is the happy path; a `CD-MA` indicator is reachable in three taps |
| T-1.7  | "Plan next week" = copy last week + prompt to change theme. Never a blank grid.                                                                                                                                                                                                                               | New plan is never empty                                                                                                            |
| T-1.8  | Coverage bar — five domain chips grey→color; "Add one" opens library filtered to the missing domain. **Covering any CD subdomain colors the CD chip.**                                                                                                                                                        | Never blocks save, never says "invalid"; `Print / Post` is **always enabled** — coverage changes its prominence only               |
| T-1.9  | → Print view + PDF. Must carry every required component (see below). DECAL attribution on the page.                                                                                                                                                                                                           | A director prints 4 weeks for one classroom in under 60s; button never disabled                                                    |
| T-1.10 | Georgia Pre-K component checklist panel — shown only when `classroom.is_ga_prek`                                                                                                                                                                                                                              | Progress list, not errors                                                                                                          |
| T-1.11 | Activity library: seeded global templates + center-scoped teacher-written ones; filters                                                                                                                                                                                                                       | Search returns useful results with 300 seeded activities                                                                           |
| T-1.12 | Parent **print copy** of the plan — codes stripped, friendly "what we're learning" line. **Print/PDF only. The shareable public link moves to Phase 5**, where it gets the privacy review a public URL needs.                                                                                                 | No child names or photos on the parent lesson copy                                                                                 |
| T-1.13 | Weekly supply list rollup, printable                                                                                                                                                                                                                                                                          | Checkbox format                                                                                                                    |
| T-1.14 | Plan archive, searchable by week and theme, date-range PDF export                                                                                                                                                                                                                                             |                                                                                                                                    |

**T-1.9 / T-1.10 — the Georgia Pre-K required components.** The printed plan must be able to carry all of these. Build the data model so each is a real field, not free text:

_(These come from DECAL's Operating Guidelines §4.6 — not a section of this document.)_

6.5 instructional hours planned · clock times matching the posted daily schedule · opening and closing activities with standards · transitions · outdoor play · **two daily read-alouds with book title + GELDS code** · a daily large-group literacy activity · small-group reading at least weekly with literature documented · **at least one daily phonological awareness activity** · small groups identified by name/initial/symbol/number · differentiated instruction for all children including those with disabilities, with IEP goals linked where applicable · planned assessment collection.

Bernard is obtaining the **IQ Guide for Planning Instruction** (`AppendixT_IQ_GuideforPlanningInstruction.docx`) — that document, not this list, is the final checklist. Build the fields; expect a reconciliation pass when the IQ Guide arrives.

**Phase 1 exit gate — two things, both non-code:**

1. Put it in front of three real teachers at a pilot center. Watch without helping. Fix what they stumble on before writing Phase 2.
2. **A paid outside reviewer** — a former Pre-K Specialist or experienced Pre-K director — scores one of our printed plans against the IQ Guide and passes it. This is PROJECT-INSTRUCTIONS.md acceptance criterion 4 and it gates Pre-K customers. Bernard owns booking it; flag it at the start of Phase 1, not the end.

### Phase 2 — Child Records

T-2.1 child record tabs 1–3 schema + RLS, **including `photo_consent boolean not null default false` on `child` and an `iep_goal` table (`child_id`, `goal_text`, `source_doc_id`, director-only RLS)** · T-2.2 roster grid with allergy + custody icons on the tile · T-2.3 Basics and People tabs, custody red banner, **photo consent toggle** · T-2.4 Health & Safety tab · T-2.5 compliance tracking per §2.4 including the never-block test and the 3300 `screened_on` 12-month window · T-2.6 expiration reminder emails · T-2.7 printable face sheet.

> `photo_consent` and `iep_goal` are enforced/consumed later (Phase 5 and T-1.5 respectively) but **collected here.** Shipping enforcement without collection is the classic version of this bug.

### Phase 3 — Observations & Passport

T-3.1 observation schema + RLS · T-3.2 → the 30-second capture flow (photo, one line, suggested indicators, save) · T-3.3 indicator suggestion from text (see §7.5 on privacy) · T-3.4 child skills view by domain and recency · T-3.5 goals · T-3.6 → passport generation · T-3.7 promotion flow with two-tap sign-off both sides, **relying on the 14-day previous-teacher grace window in §3.2** · T-3.8 WSO-friendly evidence export (CSV + copyable text).

### Phase 4 — Director tools

Dashboard (five tiles: plans posted by classroom, compliance expiring, observations this week, enrollment, staff) · monitoring evidence export · staff management · Stripe **subscription billing — we charge the center**.

### Phase 5 — Parents

Read-only child link (no account) · **public shareable link for the weekly parent lesson view** (moved here from T-1.12) · photo sharing **gated on per-child `photo_consent`, enforced in the query, not the template**.

**Not now:** attendance, meals/CACFP, **tuition billing (the center charging parents)**, scheduling, messaging, marketplace activity sharing. Incumbents own that ground. If asked to build one, push back and cite this line.

---

## 7. GUARDRAILS

### 7.1 Security non-negotiables

- Tenant isolation is enforced at the database. If you write a query that would be wrong without an app-layer filter, the RLS policy is wrong — fix the policy.
- Photos live in Supabase Storage behind signed URLs with short expiry. No public buckets. Ever.
- Photo consent is a per-child boolean checked **in the query that fetches shareable content**, not in a component conditional.
- No child ever gets a login account. If a ticket implies one, stop and escalate — it changes the COPPA posture of the whole product.
- Secrets in env vars only. The service role key never reaches the browser; verify with a build-time check.

### 7.2 Copy rules

All user-facing strings live in `lib/copy.ts`. Enforced by lint. Rules:

- 6th-grade reading level. Run new copy through a readability checker; if it scores above grade 6, rewrite it.
- **Banned words in the UI:** CRM, entity, record (as a noun for the object — say "child" or "child's page"), attribute, taxonomy, sync, validate, invalid, submit, configure, parameter, metadata.
- **Say instead:** child, page, list, thing, save, "we'll add it when you're back online", "you still need…", "add", "set up".
- Buttons are verbs a person would say out loud: "Plan next week", "Print", "Add a child", "Save this note".

**Two strings are required by the spec and must exist as registry keys:**

- `learning.notAnAssessment` — _"These are notes about what teachers have seen. This is not a test or a screening."_ Renders at the top of the child Learning tab and as a footnote on the passport's learning snapshot (PROJECT-INSTRUCTIONS.md §5.2 Tab 4).
- `standards.attribution` — _"Standards content © Georgia Department of Early Care and Learning."_ App footer and every printed lesson plan.

### 7.3 Error handling

- **No red for validation, ever.** Missing or incomplete → soft amber, plain sentence, and a button that fixes it. "You still need a math activity for Wednesday. [Add one]"
- **But red is required where it means danger.** `--critical` is reserved for allergy flags, custody/do-not-release flags, and the `SafetyBanner` — and it must actually be _used_ there (DESIGN-BRIEF §2.3). The scarcity is the point: if red also means "you left a field blank," teachers stop registering it on an allergy. Never use red for a compliance pill, a network failure, or a form field.
- **No confirmation dialogs.** Do the thing, show "Undone?" for 8 seconds.
- Network failure is not an error — it's "Saved on this phone."
- Real errors (a 500) get: "Something went wrong on our end. Your work is saved. [Try again]" plus a Sentry-style log with the center and user id.

### 7.4 Do not build

Facial recognition. Behavior scoring. Developmental-delay prediction or screening. Any feature producing a label that follows a child. Public activity marketplace. Configurable standards frameworks. A fifth role. These are out of scope permanently, not deferred.

### 7.5 AI features and child data

The indicator suggestion in T-1.6 and T-3.3 may use a model. Rules:

- **Strip identifiers before the call.** Replace child names with a token; never send DOB, address, guardian info, or health data.
- Per-center opt-in, off by default, recorded with a timestamp and the accepting user.
- Ship a deterministic fallback (keyword/tsvector match against `plain_text`) that works with the feature off. The product must be fully usable with zero AI.
- Never let a model write to `gelds_indicator`.

---

## 8. FIRST THREE THINGS TO DO

1. Read `PROJECT-INSTRUCTIONS.md` end to end, then `DESIGN-BRIEF.md`. Come back with a list of anything in this file you think is wrong or underspecified **before** writing code.
2. Do T-0.1 through T-0.4. Show me `/tests/rls` passing before anything else.
3. Do T-0.6 and show me the validation report from the GELDS import — counts per domain and per age band.

Do not build a lesson planner screen in week one, however tempting. The security foundation and the standards data are the two things that cannot be fixed later.
