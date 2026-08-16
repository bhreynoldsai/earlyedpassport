# Design Brief — App + Marketing Website

**Read `PROJECT-INSTRUCTIONS.md` first for what the product is and who uses it.**
This brief covers visual language, component system, screen-by-screen layout, and the marketing site.
Engineering consumes this via `BUILD-INSTRUCTIONS-claude-code.md` T-0.7 (tokens) — **every value in §2 must ship as a CSS custom property before any screen is built.**

**Owner:** Bernard — bernard@truenorth-inc.com
**Direction chosen:** Warm & calm, not cutesy.

---

## 1. THE DESIGN PROBLEM

Two audiences with opposite instincts have to trust the same interface.

**The teacher** has a high school diploma or a CDA, has been at this center under a year, is paid poorly, is holding a toddler, and is using a five-year-old Android phone in a room with bad wifi. If a screen looks complicated she will close it and get the paper binder. She needs the app to feel **easy and forgiving**.

**The director** is going to show this to a DECAL licensing consultant or a Quality Rated assessor. If it looks like a toy, it undermines her. She needs the app to feel **credible and official**.

The resolution: **warm surfaces, serious structure.** Soft neutral backgrounds and generous space so nothing feels dense or punishing, but real typographic hierarchy, honest data density where a director needs it, and printed output that looks like a professional document. No crayon fonts, no cartoon animals, no confetti. The warmth comes from color temperature, spacing, and rounded geometry — not from decoration.

**One-line test for any screen:** _Would a teacher tap it without hesitating, and would a director be comfortable if a state monitor saw it over her shoulder?_ Both must be yes.

### 1.1 Anti-patterns — do not ship these

- Bright primary palettes and illustrated mascots (the ClassDojo/Brightwheel default). Reads unserious to directors and, in a licensing context, actively harmful.
- Dense grey enterprise tables as the teacher's home screen.
- Empty states that say "No data."
- Red validation.
- Modals stacked on modals.
- Anything that requires a horizontal scroll on a phone.
- Icon-only buttons without labels. Every action carries a word.

---

## 2. DESIGN TOKENS

Ship as CSS custom properties on `:root`, mapped into the Tailwind theme. **No hardcoded hex anywhere in a component.**

### 2.1 Neutrals — the warm base

Slightly warm greys. Backgrounds are never pure white; text is never pure black.

| Token             | Value     | Use                                    |
| ----------------- | --------- | -------------------------------------- |
| `--bg`            | `#FBF9F6` | App background                         |
| `--surface`       | `#FFFFFF` | Cards, sheets, the week grid           |
| `--surface-sunk`  | `#F4F1EC` | Wells, disabled rows, empty plan slots |
| `--border`        | `#E5E0D8` | Hairlines                              |
| `--border-strong` | `#CFC8BC` | Input borders, focus-adjacent          |
| `--text`          | `#26221D` | Primary text                           |
| `--text-muted`    | `#6B645A` | Secondary text, GELDS codes            |
| `--text-faint`    | `#9A9287` | Placeholders, timestamps               |

### 2.2 Brand accent

A deep teal — calm, non-childish, reads as competent, and stays distinct from all five GELDS domain colors.

| Token            | Value     | Use                                      |
| ---------------- | --------- | ---------------------------------------- |
| `--accent`       | `#1F6F6B` | Primary buttons, active nav, links       |
| `--accent-hover` | `#175653` |                                          |
| `--accent-soft`  | `#E4F0EF` | Selected states, tinted backgrounds      |
| `--accent-text`  | `#12403E` | Accent-colored text on light backgrounds |

### 2.3 Status — no red for validation

| Token              | Value     | Use                                                                                                                                                        |
| ------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--attention`      | `#B87A2B` | The "you still need…" state. Warm amber, never red.                                                                                                        |
| `--attention-soft` | `#FCF3E4` | Its background                                                                                                                                             |
| `--good`           | `#2E7A52` | Complete, saved, on file                                                                                                                                   |
| `--good-soft`      | `#E7F3EC` |                                                                                                                                                            |
| `--critical`       | `#B3261E` | **Reserved exclusively for allergy and custody safety flags.** Never for form validation, never for network errors. Red must mean "a child could be hurt." |
| `--critical-soft`  | `#FDECEA` |                                                                                                                                                            |

The scarcity of red is a safety feature. If red appears for a missing form field, teachers stop seeing red for allergies.

### 2.4 GELDS domain colors — quoted, not invented

Teachers already recognize the five domain colors from their DECAL training posters and the Quick Guide. **Pull the exact hex values from the GELDS Quick Guide PDF** (https://gelds.decal.ga.gov/pdf/documents/GELDS_Quick_View.pdf) and record them here as `--gelds-pdm`, `--gelds-sed`, `--gelds-apl`, `--gelds-cll`, `--gelds-cd`.

Until they're pulled, engineering ships documented placeholders behind a `TODO(gelds-colors)` marker (BUILD-INSTRUCTIONS T-0.7). **Getting these five values is Bernard's open item #2 and it blocks final design sign-off.**

**CD needs a second level.** Cognitive Development is split into five coded subdomains — `CD-MA` Math, `CD-SC` Science, `CD-SS` Social Studies, `CD-CR` Creative, `CD-CP` Cognitive Processes — and their codes carry the segment (`CD-MA1.4a`). See PROJECT-INSTRUCTIONS.md §3.1a. Design implications:

- The `DomainChip` for CD shows `CD`. It does **not** need to show the subdomain — coverage counts five domains, and covering `CD-MA` covers CD.
- The **"By area" tab needs CD to expand**: tap the CD tile → five subdomain tiles → indicator list. Every other domain goes straight to its list. Design this asymmetry deliberately; CD holds roughly as many indicators as the other four combined, and flattening it produces an unusable list.
- All five CD subdomains share the single DECAL CD color. Differentiate them by label, not hue.

Rules for using them:

- **Contained, not ambient.** Domain color appears only on: domain chips, the coverage bar, the left edge of an activity card, and domain tiles in the indicator chooser. It never colors a page background, a header, or a button.
- If a DECAL color fails 4.5:1 contrast as text, use it as a **background swatch or a 4px left rule with dark text on top** — do not alter DECAL's hue to make it pass.
- Never rely on color alone. Every domain chip carries its acronym (`PDM`, `SED`, `APL`, `CLL`, `CD`) and, where space allows, the full name.

### 2.5 Type

**One family: Inter** (or system sans fallback). No display face, no rounded "friendly" face — those read as childish and print badly.

| Token            | Size / line-height | Weight                                | Use                                         |
| ---------------- | ------------------ | ------------------------------------- | ------------------------------------------- |
| `--text-display` | 30/36              | 600                                   | Marketing hero only                         |
| `--text-h1`      | 24/30              | 600                                   | Screen title                                |
| `--text-h2`      | 19/26              | 600                                   | Section heading                             |
| `--text-body-lg` | 17/26              | 400                                   | **Default body on mobile.** Not 14. Not 16. |
| `--text-body`    | 15/22              | 400                                   | Dense contexts (director tables)            |
| `--text-small`   | 13/18              | 400                                   | Metadata                                    |
| `--text-code`    | 12/16              | 500, `--text-muted`, tracking +0.02em | GELDS codes, always                         |

17px body on mobile is deliberate — this app is read at arm's length in poor classroom lighting, often by someone over 40.

### 2.6 Space, radius, elevation

- **Space scale:** 4, 8, 12, 16, 24, 32, 48, 64. Nothing between.
- **Radius:** `--r-sm` 8px (chips, inputs) · `--r-md` 12px (cards) · `--r-lg` 16px (sheets) · `--r-full` (avatars, pills). Rounded, not pill-shaped-everything.
- **Elevation:** two levels only. `--shadow-card` `0 1px 2px rgb(38 34 29 / .06), 0 1px 3px rgb(38 34 29 / .04)` and `--shadow-sheet` `0 -4px 24px rgb(38 34 29 / .12)`. Everything else is a border.

### 2.7 Touch and motion

- **Minimum tap target 48×48px.** Primary actions 56px tall, full-width on mobile.
- Minimum 8px between adjacent targets.
- Motion: 150ms ease-out for state, 250ms for sheets. Respect `prefers-reduced-motion`. No bounce, no spring, no celebration animations.

---

## 3. COMPONENT INVENTORY

Built on shadcn/ui primitives, restyled to the tokens above. Design each once, in all states (default / hover / focus / active / disabled / loading / empty / offline).

**Core**
`Button` (primary, secondary, quiet — **there is no destructive/red variant**; deletes use a quiet button plus an undo toast, per BUILD-INSTRUCTIONS §7.3's no-confirmation-dialogs rule) · `Input` · `Textarea` (autosaving, with dictate affordance) · `Select` · `Checkbox` · `Sheet` (bottom on mobile, side on desktop — **replaces modals everywhere**) · `Toast` (undo host) · `Tabs` · `Avatar` · `Banner` (attention / good / critical)

**Domain-specific**

- `DomainChip` — acronym + color + optional full name. Grey when uncovered, colored when covered.
- `CoverageBar` — five DomainChips in a row plus a plain-language line: "You've got 4 of 5 areas this week."
- `IndicatorRow` — plain-English text large, `full_code` small and grey beneath, checkbox left, DECAL verbatim text on expand.
- `ActivityCard` — title, one-line description, domain chips, 4px left rule in the primary domain's color. Empty variant is a dashed well: "Tap to add".
- `PlanSlot` — a grid cell; holds an ActivityCard or the empty well.
- `ChildTile` — photo, first name + last initial, allergy icon, custody icon. **Safety icons render on the tile, never only inside the record.**
- `SafetyBanner` — the only red thing in the product. Allergies and custody. Top of child record, persistent, not dismissible.
- `ComplianceStatusPill` — four states: `Missing` · `Appointment card` · `On file` · `Expired`, plus a fifth display case for Form 3300 only: **`Screening too old`** (the screening happened more than 12 months before the child started — the form is on file but doesn't count). Note: **every one of these is amber or neutral, never red, and none of them blocks anything** — DECAL prohibits requiring these forms as a condition of enrollment.
- `SaveChip` — `Saved` / `Saving…` / `Saved on this phone`. One quiet chip, top right. Never an error.
- `NudgePanel` — amber, plain sentence, action button. Never blocks.
- `EmptyState` — illustration-free. A sentence about what goes here plus the button that creates the first one. Never "No data."

---

## 4. LAYOUT SYSTEM

**Mobile-first, three breakpoints only:** `<640` phone (one column) · `640–1024` tablet (two column, the real classroom device) · `>1024` desktop (director work).

**Phone navigation:** bottom tab bar, three items max — **My Room** (roster) · **Plans** · **More**. A director gets a fourth, **Center**. Labels always visible; never icon-only.

**Desktop:** left sidebar, same items, plus the director dashboard.

**The floating `+ Observe` button** sits above the bottom bar on the roster and child screens. It is the single most-used control in the product and should be the most obvious thing on screen.

---

## 5. SCREEN SPECS — THE APP

**Design runs ahead of engineering — that's intended.** But know which phase each screen ships in, because Phase 1 ships the planner _alone_ and must stand up without a roster:

| Screen                      | Build phase | Design priority |
| --------------------------- | ----------- | --------------- |
| 5.2 Week Grid               | Phase 1     | **1st**         |
| 5.4 Indicator Chooser       | Phase 1     | **2nd**         |
| 5.3 Activity Editor         | Phase 1     | 3rd             |
| 5.9 Print — monitoring plan | Phase 1     | 4th             |
| 5.1 Roster                  | Phase 2     | 5th             |
| 5.6 Child Record            | Phase 2     | 6th             |
| 5.5 Observe                 | Phase 3     | 7th             |
| 5.7 Passport                | Phase 3     | 8th             |
| 5.8 Director Dashboard      | Phase 4     | 9th             |

**In a Phase 1–only ship, the week grid is the teacher's home screen** and the bottom bar has one item. Design that state — don't assume the roster exists.

### 5.1 Roster (teacher home) — the default screen _(Phase 2)_

Header: classroom name, today's date, present count ("14 here today").
Body: photo grid of `ChildTile`s, 3 across on phone, 5 on tablet. Allergy and custody icons visible at tile level.
Persistent: `+ Observe` FAB.
Secondary: quiet link to "This week's plan".

**Design intent:** she opens the app and sees her children's faces. Nothing else competes.

### 5.2 The Week Grid — the planner

**Phone:** one day per screen, horizontal day-picker chips across the top (M T W T F), swipe or tap between days. Rows are the routine (Arrival, Circle, Small Group A…). **Never a scrollable table on a phone.**
**Tablet/desktop:** the full 5-column grid, rows = routine.

Sticky top: the `CoverageBar`, plus the theme name, plus `SaveChip`.
Bottom: one primary button — `Print / Post` — quiet grey until all five domains are covered, then filled with `--accent`. **It is never disabled.** This is the only place in the product where a control changes prominence to signal progress; prominence is the entire mechanism, and an incomplete plan must always be printable.

Empty slots are dashed wells reading "Tap to add" — the grid is never intimidating whitespace.

**Georgia Pre-K classrooms only:** a collapsible checklist card below the grid showing the **DECAL Operating Guidelines §4.6** / IQ Guide required components (two daily read-alouds with titles and codes, daily phonological awareness, large-group literacy, weekly small-group reading, transitions, outdoor play, clock times, 6.5 instructional hours, differentiation with IEP links, assessment collection). **Presented as a progress list with checkmarks — never as errors, never blocking save.**

### 5.3 Activity Editor (bottom sheet)

Sheet, not a page — she never loses the grid behind it.
Fields top to bottom: Title · What you do (autosaving textarea with a dictate button) · **What they're learning** (the indicator chooser, see 5.4) · Materials (chip input) · Differentiation (two labelled boxes + IEP goal picker when a child in the room has an IEP flag) · Time.
No Save button. `SaveChip` shows state. Swipe down or tap Done to close.

### 5.4 The Indicator Chooser — the most important UI in the app

A sheet with three tabs. **Tab order and default matter enormously.**

**Tab 1 — Suggested (default, and the happy path).** Header: "Activities like this usually cover:" Four to six `IndicatorRow`s, **pre-checked**. Most teachers accept these and close the sheet. Design for a two-second interaction: open, glance, Done.

**Tab 2 — By area.** Five large domain tiles in DECAL colors → tap one → checkbox list of `IndicatorRow`s for this classroom's age band.

**Exception: CD expands to a second level.** Tapping _Thinking & Learning_ (CD) reveals five subdomain tiles — Math, Science, Social Studies, Creative, Thinking Skills — then the indicator list. Every other domain goes straight to its list. See §2.4. The path is still three taps to a `CD-MA` indicator; make the back path obvious.

A quiet toggle: "Show nearby ages" (real classrooms are mixed).

**Tab 3 — Search.** One field. She types "cutting" or "sharing" and gets plain-English matches.

Persistent rules across all three: plain English is the large text, `full_code` is small and grey underneath, **she never types a code**. Above ~6 selected, a gentle amber line appears: "That's a lot for one activity — pick the 2 or 3 you'll actually watch for." It advises; it does not prevent.

### 5.5 Observe (the 30-second flow)

Four steps, one screen, no wizard:

1. Child picker — the same photo grid, multi-select for group observations
2. Big camera button (skippable)
3. One line: "What did you see?" — textarea with a prominent microphone button
4. Suggested indicators appear beneath as she types; tap to confirm, or ignore entirely

Autosaves as a draft from the first keystroke. Works fully offline. Closing without saving is impossible.

### 5.6 Child Record

Header: photo, name, how to say it, age, classroom. Immediately below: `SafetyBanner` if allergies or custody flags exist — red, persistent, undismissable.
Five tabs: **Basics · People · Health · Learning · Notes**.

**Basics** carries the **photo consent toggle** — collected at enrollment, and the thing every shareable surface in the product checks. It has to exist here or Phase 5's enforcement has nothing to enforce.

**Health** leads with allergies, then compliance pills, then medical. The two forms have **different rules and must not share a countdown**:

|                       | Form 3231 (Immunization) | Form 3300 (Vision/Hearing/Dental/Nutrition)                               |
| --------------------- | ------------------------ | ------------------------------------------------------------------------- |
| Deadline              | 30 days from start       | **90 days** from start                                                    |
| Extra field           | —                        | `Screened on` — must be within the 12 months **before** the child started |
| Out-of-window display | —                        | amber pill: _"Screening too old — needs a new one"_                       |

Nothing here is red and nothing here blocks.

**Learning** opens with this exact line, in `--text-muted`, above the observations: _"These are notes about what teachers have seen. This is not a test or a screening."_ Not a dismissible tooltip — permanent body text.

### 5.7 Child Passport

Designed as a **printed page first**, then rendered on screen. One page, portrait.
Order: photo and name block · red-flag box (allergies, medical, custody) · home language and family context · "Five things to know about me" · learning snapshot (domain coverage, current goals, three work samples) · who to call · previous teacher's sign-off line.

Footnote beneath the learning snapshot, small: _"These are notes about what teachers have seen. This is not a test or a screening."_

The sign-off is filled in by the **previous** teacher, after the child has already moved. She keeps access for 14 days for exactly this — design the state where she opens a passport for a child no longer in her room.

This is the artifact that sells the product to a director. Make it look like something a person would be glad to receive.

### 5.8 Director Dashboard

Five tiles, one screen, everything printable: plans posted by classroom (the headline) · compliance expiring in 30 days · observations logged this week · enrollment by room · staff.

### 5.9 Print styles — a first-class deliverable, not an afterthought

Two distinct print designs:

- **Lesson plan (monitoring copy).** Letter, landscape, one week per page. Black on white, no color fills, 11pt minimum. GELDS codes printed next to every activity. Header: center name, classroom, teacher, week, theme. Footer: "Standards content © Georgia Department of Early Care and Learning." This document has to sit in a binder next to state paperwork and look like it belongs.
- **Parent copy.** Same week, codes stripped, friendly "What we're learning this week" line per day, warmer spacing. No child names, no photos. **Print/PDF only in Phase 1** — the shareable public link is Phase 5, because a public URL needs a privacy review this print copy doesn't.

Also print-designed: the supply list, the child face sheet, the passport, and the director's monitoring packet.

---

## 6. ACCESSIBILITY — REQUIREMENTS, NOT ASPIRATIONS

- WCAG 2.1 AA. 4.5:1 text contrast, 3:1 for UI boundaries.
- Full keyboard operation with a visible 2px `--accent` focus ring. Directors work on laptops.
- Every input has a persistent visible label. **No placeholder-as-label anywhere.**
- Color is never the only signal — domain chips carry acronyms, status pills carry words, safety flags carry icons _and_ text.
- Tested at 200% browser zoom and with the OS font size maxed.
- Screen-reader labels on every icon button.
- `prefers-reduced-motion` respected.
- Design every string to survive **Spanish, roughly 30% longer**. Spanish UI is on the roadmap; don't build layouts that break when text grows.

---

## 7. WHAT TO DELIVER (app)

1. Token sheet — every value in §2, with the five DECAL domain colors filled in from the Quick Guide PDF
2. Component sheet — §3, all states
3. High-fidelity screens at 375px, **in the §5 priority order**: week grid, **indicator chooser (all three tabs, including CD's second level)**, activity editor, roster, child record, observe flow, passport
4. Tablet (768px) variants of week grid and roster
5. Desktop director dashboard
6. Print designs: monitoring lesson plan, parent lesson plan, passport, face sheet
7. A short prototype of **plan next week** — the Phase 1 flow that gets tested with real teachers at the pilot center. (A **record an observation** prototype follows for Phase 3; don't build both before the first teacher test.)

---

## 8. THE MARKETING WEBSITE

**Five pages. No more.** Home · How it works · Pricing · Why we built it · Book a demo.

Same tokens, same type scale, same teal. The site and the product must be visibly the same company — a director who books a demo should recognize the app when she sees it.

**Home, above the fold:**

- Headline, one sentence a director understands immediately: _"Weekly lesson plans with GELDS codes already on them — in 15 minutes, not 2 hours."_
- Subhead naming the buyer and the state: Georgia child care centers and Pre-K classrooms.
- One primary button: **Book a demo**. One secondary: **See a sample plan** (links to a real printed PDF).
- **A real screenshot of the week grid**, on a phone, above the fold. Not an abstract illustration. Not a stock photo of children — those raise consent questions and read as generic.

**Below the fold, in order:** the 3-step story (Pick your theme → Tap activities → Print and post) · a real printed monitoring plan shown at readable size · the room-to-room passport, framed as "the new teacher isn't starting from zero" · a 90-second video of an actual teacher building a plan · one pilot-director quote · trust row (your data is yours, one-click export, encrypted, no child accounts) · pricing.

**Voice:** plain, specific, unhurried. Talk about Friday afternoons and monitoring binders, not "empowering educators" or "transforming early childhood outcomes." Name Georgia, name GELDS, name DECAL. Specificity is the credibility.

**Legal / trust, sitewide:** DECAL standards attribution in the footer. Clear privacy page written in plain English — a director will read it. Say plainly: the center owns its data, children have no accounts, and nothing is sold or used to train anyone's model.

**Do not:** use stock photos of children, claim DECAL endorsement or approval (attribution is not endorsement, and permission for commercial use of the standards text is still pending), or state a compliance guarantee. Say "built to DECAL's required lesson plan components," never "DECAL approved."

---

## 9. OPEN ITEMS FOR BERNARD

1. Product name and logo — every screen in this brief has a placeholder wordmark.
2. The five DECAL domain hex values, pulled from the GELDS Quick Guide.
3. Confirmation from DECAL on commercial use and attribution of GELDS text (blocks the website's standards claims as well as the app).
4. Two or three pilot-center photos of real classrooms, with releases, if you want any environmental imagery on the site. Otherwise the site runs on product screenshots alone — which is the stronger option anyway.
5. **Book the outside reviewer** — a former Pre-K Specialist or experienced Pre-K director — to score a printed monitoring plan against the IQ Guide. This gates the launch (PROJECT-INSTRUCTIONS.md acceptance criterion 4), and the print design in §5.9 is what they'll be scoring.
