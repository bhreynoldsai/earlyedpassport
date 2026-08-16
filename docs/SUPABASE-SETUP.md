# Supabase setup

Standing up a project from nothing. Do staging first; production waits until
there is something worth deploying.

> **NEVER POINT A DEV MACHINE AT PRODUCTION.**
> **NO REAL CHILD DATA IN STAGING, EVER — SEED DATA ONLY.**
>
> These are from `PROJECT-INSTRUCTIONS` §1.2 and they are not stylistic.

---

## 1. Create the project

| Field                               | Value                                         |
| ----------------------------------- | --------------------------------------------- |
| Project name                        | `earlyedpassport-staging`                     |
| Region                              | East US (North Virginia)                      |
| GitHub                              | leave unset — migrations are gated through CI |
| **Enable Data API**                 | ✅ **on** — `supabase-js` needs it            |
| **Automatically expose new tables** | ❌ **off** — see below                        |
| **Enable automatic RLS**            | ✅ **on**                                     |

Copy the database password into a password manager as you go. You need it for
step 2, and it is as powerful as the service key.

### Why "Automatically expose new tables" is off

That setting grants privileges to the Data API roles whenever a table appears.
We do it ourselves instead, in `supabase/migrations/0006_grants.sql`, for two
reasons:

1. **A dashboard toggle is not in version control.** Recreating this project, or
   standing up production later, must bring its own privileges rather than
   depending on somebody remembering a checkbox.
2. **The automatic version grants every verb.** We grant only the verbs that
   have a policy, so **no table carries a `DELETE` grant** — nothing in this
   product hard deletes, and that is now enforced twice: once by the absence of
   delete policies in `0004_rls.sql`, and again by the absence of delete grants.

`tests/rls/grants.test.ts` asserts the granted verbs are exactly the policied
verbs, so the two can never drift apart silently.

**Automatic RLS stays on** as a backstop. Our migrations already `enable` _and_
`force` RLS on every table; the event trigger only matters on the day somebody
adds a table and forgets.

---

## 2. Apply the migrations

**Every command below runs from inside a clone of this repository.** `link`
writes its state into `supabase/.temp`, and `db push` reads the migrations from
`supabase/migrations` — run either from your home directory and the CLI links
the wrong folder while `pnpm` reports no `package.json`.

```bash
git clone https://github.com/bhreynoldsai/earlyedpassport.git
cd earlyedpassport
pnpm install
```

The project starts empty. Until the push runs, every query returns
`PGRST205 — Could not find the table`.

```bash
pnpm dlx supabase@latest login
pnpm dlx supabase@latest link --project-ref <your-project-ref>
pnpm dlx supabase@latest db push
```

The project ref is the subdomain: for `https://abcdefgh.supabase.co` it is
`abcdefgh`. `db push` prompts for the database password from step 1.

Migrations are **forward-only**. Never edit one that has been applied — add a
new numbered file. `pnpm db:verify` rebuilds the schema from zero in a scratch
database on every CI run, which is what catches an edit to an applied migration.

---

## 3. Load the GELDS standards

```bash
pnpm gelds:import --edition=portal-2026-08-16 --load
```

679 indicators from the live DECAL portal. The 2013 edition can be loaded
alongside it; both versions coexist by design. See `docs/GELDS-EDITIONS.md` for
why that matters — the two differ by 120 codes.

---

## 4. Environment variables

Set these in **Vercel → Settings → Environment Variables**, and mirror the first
two into a local `.env.local` (never committed).

| Variable                               | Where it goes         | Safe to share? |
| -------------------------------------- | --------------------- | -------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Vercel + `.env.local` | yes            |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Vercel + `.env.local` | yes            |
| `SUPABASE_SERVICE_ROLE_KEY`            | **Vercel only**       | **no — never** |

The first two are _designed_ to reach browsers; row level security, not
secrecy, is what protects the data behind them.

The third bypasses RLS completely. It never goes in a chat message, never in a
repo, and never in a `NEXT_PUBLIC_` variable — `next.config.ts` throws at build
time if it finds one. Exactly two things use it: the GELDS importer and the seed
script.

### Key naming

Supabase renamed the browser key. New projects issue `sb_publishable_…` under
`PUBLISHABLE_KEY`; older ones issue a JWT under `ANON_KEY`. `lib/supabase/env.ts`
accepts either, so both vintages work unchanged. Same for the server key:
`SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY`.

---

## 5. Seed the demo center

```bash
pnpm seed
```

One invented center — three classrooms, twelve children, four staff accounts,
all with `5eed…` ids so demo rows are obvious in any query result. Idempotent:
run it as often as you like.

It prints four sign-ins sharing one password. Worth trying
`teacher.sunshine@example.com`: Mateo Ríos moved up to Explorers nine days ago
and she should still see him. That is the **14-day handoff window** in
`auth_scoped_child_ids()`, which exists so a promotion cannot lock a teacher out
of a passport sign-off she still owes.

**The seed refuses to run** if it finds a center it did not create. That is the
signal that it is pointed at a real deployment, and the only safe response is to
stop before writing anything.

**Not seeded: lesson plans.** Those tables arrive with T-1.1. Inventing a schema
ahead of its ticket is how the schema ends up wrong.

---

## Local development without Supabase

Most work does not need a Supabase project at all.

Start the local stack on 54321/54322, rebuild the schema from zero, then run the
248 tests including RLS against real Postgres:

```bash
supabase start
pnpm db:verify
pnpm test
```

> Every command in this file is written without trailing `#` comments on
> purpose. macOS ships zsh, and an interactive zsh does **not** treat `#` as a
> comment unless `interactive_comments` is set — so a pasted line with an
> explanatory comment on the end passes the comment to the command as
> arguments. Explanations go above the block, never beside the command.

The RLS suite needs `DATABASE_URL` pointed at a throwaway Postgres. Without it
those tests **skip**, and a green run that skipped them proves nothing — CI
fails the build if it detects that.
