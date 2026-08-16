# Project Instructions — GELDS Lesson Planner + Child CRM

**Working name:** _(fill in)_
**Owner:** Bernard — bernard@truenorth-inc.com
**Last updated:** 2026-08-14
**Status:** Draft v1 — intake section awaiting Bernard's input

---

# PART 0 — INTAKE (Bernard fills this in)

> This is the section for your details. Fill in what you know, write `TBD` for what you don't. Everything below Part 0 is written to work with whatever you put here. When you change something here, tell the AI "re-read Part 0 and update the spec" and the rest of the document gets adjusted.

## 0.1 Business basics

| Field                                                          | Your answer |
| -------------------------------------------------------------- | ----------- |
| Product name                                                   |             |
| Domain name (owned or wanted)                                  |             |
| Company / legal entity                                         |             |
| Are you currently operating a child care center? Which one(s)? |             |
| Do you have centers already willing to pilot this? How many?   |             |
| Target launch date for a usable v1                             |             |
| Budget range for build + first year hosting                    |             |
| Do you have a designer / brand already?                        |             |

## 0.2 Who you're selling to

| Field                                                                               | Your answer |
| ----------------------------------------------------------------------------------- | ----------- |
| Primary customer (center director? owner? franchise group?)                         |             |
| Center size you're aiming at (# classrooms, # children)                             |             |
| Georgia-only at launch, or other states later?                                      |             |
| Are these Georgia Pre-K funded classrooms, private pay, Head Start, CAPS, or a mix? |             |
| Are your targets Quality Rated participants?                                        |             |
| Price you have in mind (per center/mo? per classroom/mo? per child?)                |             |

## 0.3 The pain you're solving (in your words)

> Write plainly. What do teachers at your center complain about? What does the director redo every week? What falls through the cracks when a child moves rooms?

- Lesson planning pain:
- Child record / handoff pain:
- Director oversight pain:
- Parent communication pain:
- What they use today (paper? Excel? Brightwheel? Procare? nothing?):

## 0.4 Must-have vs. nice-to-have for v1

Mark each `MUST`, `LATER`, or `NO`.

| Feature                                                    | v1? |
| ---------------------------------------------------------- | --- |
| GELDS-tagged weekly lesson plan builder                    |     |
| Printable / postable lesson plan (parent-facing wall copy) |     |
| Activity library teachers can search and drop in           |     |
| Child profile with GELDS-aligned observations              |     |
| Child "passport" that follows them room to room            |     |
| Photo/video observation capture from phone                 |     |
| Attendance / sign-in-out                                   |     |
| Parent app or parent messaging                             |     |
| Immunization & Form 3300 expiration tracking               |     |
| Incident / accident reports                                |     |
| Meal counts (CACFP)                                        |     |
| Billing / tuition                                          |     |
| Staff scheduling & ratio tracking                          |     |
| Quality Rated / Pre-K monitoring evidence export           |     |
| Spanish language UI                                        |     |

## 0.5 Constraints and non-negotiables

- Devices teachers actually have in the classroom:
- Reliable wifi in classrooms? (Y/N — this decides offline mode):
- Anything you've already built or bought that this must connect to:
- Anything you absolutely do NOT want in the product:

## 0.6 Notes / anything else

>

---

# PART 1 — WHAT WE ARE BUILDING

Two products that share one database and one login:

**A. The Lesson Planner** — a teacher opens it Friday afternoon, picks next week's theme, and in under 15 minutes has a complete weekly lesson plan with the correct Georgia GELDS standard codes attached to every activity, ready to print and post.

**B. The Child CRM** — one record per child that holds who they are, who can pick them up, what they can't eat, what they're working on, and what a teacher needs to know. It travels with the child when they move from the Infant room to Toddlers to Pre-K, so the new teacher isn't starting from zero.

Delivered as a **responsive web app** (works in a phone browser, a tablet, and a desktop) plus a **marketing website**. Not a native app in v1 — an installable web app (PWA) covers the phone case without app store friction.

**Design target:** a teacher with a high school diploma and a CDA, who is holding a toddler with one arm, using a five-year-old Android phone. If she can't do it one-handed in under two minutes, it's designed wrong.

---

# PART 2 — THE USERS (design around real ability, not ideal ability)

## 2.1 Lead Teacher / Assistant Teacher

**Typical background:** High school diploma; many hold a CDA or Technical Certificate. Some have an associate's or bachelor's. Pay is low, turnover is high — assume the person using this has been at the center under a year.

**What they can do easily:** Use a smartphone. Text. Take photos. Use Facebook and TikTok. Fill in a form with clear labels. Pick from a list. Tap a big button.

**What they struggle with or won't do:**

- Typing long text on a phone → let them **dictate or pick from suggestions** instead
- Remembering a code like `CLL5.4a` → **never make them type a code; always let them pick a plain-English skill and attach the code behind the scenes**
- Multi-step wizards with more than 3 steps → keep flows to 3 taps or fewer
- Anything requiring them to be at a desktop → they don't have a desk
- Jargon: "taxonomy," "records," "entities," "sync," "attribute" → use "list," "child," "thing," "save"
- Losing work when wifi drops → **autosave constantly, work offline, sync later**

**Design rules that follow:**

1. **Nothing is ever lost.** Every screen autosaves. No "Save" button anxiety.
2. **Start from something, never from blank.** Every new lesson plan starts as a copy of last week or a template. Every observation starts from a suggested phrase.
3. **Plain English first, codes second.** Show "Uses 5–7 word sentences," show `CLL5.4a` small and grey underneath.
4. **Big tap targets, one column, no horizontal scrolling.**
5. **Reading level: 6th grade** for all UI copy, help text, and error messages.
6. **No red errors.** If something's missing, show a soft yellow "You still need to add a math activity for Wednesday" with a button that fixes it.
7. **Undo, not confirm.** Don't ask "Are you sure?" — let them undo.

## 2.2 Center Director / Owner

**Background:** Often a former teacher. Usually has an associate's or bachelor's degree and a director's credential. Comfortable with email and Excel, but not with anything that requires configuration.

**What they need:**

- See at a glance which classrooms have a lesson plan posted for next week and which don't
- Print an evidence packet when the DECAL licensing consultant or Quality Rated assessor shows up
- Know which children have an immunization form (3231) or health screening (3300) about to expire
- Add and remove staff without calling support
- Not be the bottleneck — teachers should be able to work without asking her for anything

**Design rules:** One dashboard, five tiles, everything printable to PDF. Setup wizard on day one that takes under 20 minutes and can be finished later.

## 2.3 Parent / Guardian (read-mostly, v1 or v2)

Wants: what did my child do today, what are they learning, is my paperwork current. Gets a link — no account creation, no app download, in v1.

## 2.4 Anti-personas

We are **not** building for: curriculum designers, researchers, district administrators, or anyone who wants to configure their own standards framework. Resist every feature request that serves them.

---

# PART 3 — GELDS: WHAT IT IS AND HOW TO USE IT IN THE PRODUCT

**GELDS = Georgia Early Learning and Development Standards.** Published by DECAL (Bright from the Start: Georgia Department of Early Care and Learning). Introduced in 2013, replacing the older GELS (birth–3) and Pre-K Content Standards, creating one continuous set of standards from birth to age five.

Official site: https://gelds.decal.ga.gov/

## 3.1 The five domains

| Code    | Domain                                                                                      |
| ------- | ------------------------------------------------------------------------------------------- |
| **PDM** | Physical Development & Motor Skills                                                         |
| **SED** | Social & Emotional Development                                                              |
| **APL** | Approaches to Play & Learning                                                               |
| **CLL** | Communication, Language & Literacy                                                          |
| **CD**  | Cognitive Development & General Knowledge — **split into five coded subdomains** (see 3.1a) |

### 3.1a CD is not a flat domain — this trips up every implementation

Verified against DECAL's published indicator PDFs. Cognitive Development carries a **subdomain segment in the code itself**:

| Code    | Subdomain            | Example indicator                                        |
| ------- | -------------------- | -------------------------------------------------------- |
| `CD-MA` | Mathematics          | `CD-MA1.4a` Recites numbers up to 20 in sequence         |
| `CD-SC` | Science              | `CD-SC1.4a` Uses senses to observe, classify, and learn  |
| `CD-SS` | Social Studies       | `CD-SS1.4a` Describes his/her family structure and roles |
| `CD-CR` | Creative Development | `CD-CR2.4a` Uses materials to create original work       |
| `CD-CP` | Cognitive Processes  | `CD-CP1.4a` Recognizes cause and effect relationships    |

The other four domains (PDM, SED, APL, CLL) have **no** subdomain segment. So the code format is not uniform:

```
PDM6.4a      ← four domains look like this
CD-MA1.4a    ← CD looks like this
```

**Consequences to design around:**

- The database needs a nullable `subdomain_code` column, and code validation must accept both shapes.
- The indicator chooser's "By area" tab needs **five tiles, with CD expanding to a second level** of five subdomain tiles. Do not flatten CD into one list — it holds roughly as many indicators as the other four domains combined.
- Coverage checking still counts **five domains**. Covering `CD-MA` covers CD. Do not require all five CD subdomains weekly — DECAL doesn't.

Source: [GELDS 48–60 Months indicators](https://gelds.decal.ga.gov/pdf/indicators/48-60_Indicators.pdf)

Each domain is color-coded in official DECAL materials. **Use the same colors** — teachers already recognize them from their training and wall posters. Pull the exact colors from the GELDS Quick Guide PDF.

## 3.2 The hierarchy

```
DOMAIN  → [SUBDOMAIN] →  STRAND  →  STANDARD  →  AGE  →  INDICATOR
 PDM         (none)      (grouping)    6.         3         b     →  PDM6.3b
 CD          -MA         (grouping)    1.         4         a     →  CD-MA1.4a
```

- **Domain** — one of the five above
- **Subdomain** — CD only: `-MA`, `-SC`, `-SS`, `-CR`, `-CP`
- **Strand** — a grouping of similar standards within a domain
- **Standard** — a general statement of knowledge within a strand (a strand can have several)
- **Age** — `0` = 0–12 mo, `1` = 12–24 mo, `2` = 24–36 mo, `3` = 36–48 mo, `4` = 48–60 mo
- **Indicator** — a specific, measurable, observable skill. Letters `a`–`f` when a standard has several indicators at one age.

**The indicator is the unit teachers actually attach to activities.** Everything in this product hangs off indicators.

## 3.3 Where lesson plans have to use GELDS

For **Georgia's Pre-K Program** (state-funded Pre-K), DECAL's Pre-K Providers' Operating Guidelines (§4.6) and the _IQ Guide for Planning Instruction_ require the written plan to include:

- Plans based on GELDS, covering **all five learning domains**
- **The corresponding GELDS indicator code printed on the plan next to each activity**
- **Differentiated instruction** based on the individual needs of _all_ children in the class, including children with disabilities — and IEP goals and objectives used in planning where applicable. (Note: DECAL's current term is "differentiated instruction," not "adaptations.")
- A minimum of **6.5 instructional hours per day** planned
- **Clock times that match the classroom's posted daily schedule**
- Opening and closing activities, with standards
- **Transitions** planned
- **Outdoor play** on the plan
- **Two daily read-alouds**, with book titles and GELDS codes
- A **daily large-group literacy activity**
- **Small-group reading at least weekly**, with the literature and activity documented
- **At least one daily phonological awareness activity**, following a progression across the year
- Small groups identified by name, initial, symbol, or number
- **Planned assessment collection** documented on the plan or on a Planning for Assessment Template
- Plans **completed before the week starts**, kept on site for the entire school year, organized and easily accessible for specialist review
- If you don't use DECAL's own template, yours must contain all required components

**This is the product's core value proposition.** Build our template to satisfy DECAL's required components exactly, so a center can use ours instead of the paper one and pass monitoring.

**Before launch, obtain and check field-by-field against:** (a) the current DECAL Pre-K lesson plan template, (b) the _FAQ for Planning Instruction_, and (c) the **IQ Guide for Planning Instruction** — this last one is the instrument Pre-K Specialists actually score against, and it is the real checklist. It is published as `AppendixT_IQ_GuideforPlanningInstruction.docx` on decal.ga.gov even though the guidelines body text refers to it as Appendix N; that inconsistency is DECAL's and will make the file hard to find.

Georgia Pre-K classrooms also use **Work Sampling Online (WSO)** for formative assessment — 69 indicators across 7 domains, all aligned to GELDS. **We do not replace WSO.** We make it easier to feed. Design observations so a teacher can export or copy evidence into WSO; do not try to be the assessment system of record for Pre-K.

## 3.4 Getting the GELDS data into the database

The standards are published by DECAL as public documents. Plan:

1. Pull the full standards set from https://gelds.decal.ga.gov/GELDS and the PDF exports (GELDS Quick Guide, GELDS Standards for Age Ranges).
2. Parse into a table: `domain, strand, standard_number, age_band, indicator_letter, full_code, indicator_text`.
3. Store as reference data the app reads but never lets a user edit.
4. **Write to DECAL before launch** to confirm permissible use and attribution for a commercial product, and to ask whether a machine-readable export exists. Do not assume. Put the answer in Part 0.6.
5. Include a visible attribution line: standards content © Georgia Department of Early Care and Learning.
6. Version the dataset (`gelds_version: "2013-rev-YYYY"`) so a future revision doesn't silently change historical lesson plans.

---

# PART 4 — MODULE A: THE LESSON PLANNER

## 4.1 The core loop (this must be excellent; everything else is secondary)

1. Teacher taps **Plan Next Week**
2. App shows last week's plan, pre-copied, with a soft prompt: "Change the theme?"
3. Teacher picks a theme (from a list, or types one)
4. App shows the week grid, already populated with suggested activities for her classroom's age band
5. She swaps out what she doesn't want, tapping activities from the library
6. A **coverage bar** at the top fills in as she goes: five domain chips that go from grey to color as each domain gets an activity
7. When all five are colored, **Print / Post** brightens from quiet grey to the accent color
8. Done in under 15 minutes

**Print / Post is never disabled.** Coverage changes its _prominence_, never its availability. A teacher must always be able to print an incomplete plan.

## 4.2 The weekly plan structure

Rows are the daily routine, columns are the days:

|                                | Mon | Tue | Wed | Thu | Fri |
| ------------------------------ | --- | --- | --- | --- | --- |
| Arrival / Table Toys           |     |     |     |     |     |
| Morning Meeting / Circle       |     |     |     |     |     |
| Small Group A                  |     |     |     |     |     |
| Small Group B                  |     |     |     |     |     |
| Center Time (learning centers) |     |     |     |     |     |
| Outdoor / Large Motor          |     |     |     |     |     |
| Story Time                     |     |     |     |     |     |
| Rest / Quiet                   |     |     |     |     |     |
| Afternoon Activity             |     |     |     |     |     |
| Closing Circle                 |     |     |     |     |     |

Routine rows are **configurable per classroom** — an infant room's day looks nothing like a Pre-K day. Ship sensible defaults per age band so nobody has to configure anything.

## 4.3 What an activity holds

| Field            | Required    | Notes                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title            | Yes         | Short. "Leaf Sorting."                                                                                                                                                                                                                                                                                                                                                                                    |
| What you do      | Yes         | 2–4 sentences, plain language, teacher-facing                                                                                                                                                                                                                                                                                                                                                             |
| GELDS indicators | Yes, ≥1     | Picked from a chooser, never typed                                                                                                                                                                                                                                                                                                                                                                        |
| Age band         | Yes         | Auto-filled from classroom                                                                                                                                                                                                                                                                                                                                                                                |
| Materials        | No          | Checkbox list; rolls up into a weekly supply list                                                                                                                                                                                                                                                                                                                                                         |
| Differentiation  | Conditional | **Required for Georgia Pre-K plans.** Two boxes: "For a child who needs more support" and "For a child who's ready for more," **plus** a linked-IEP-goal picker that appears when any child in the classroom has an IEP/IFSP flag. DECAL frames this as class-wide differentiation for _all_ children including those with disabilities — two exception boxes alone will not satisfy a specialist review. |
| Photo            | No          | For the library preview                                                                                                                                                                                                                                                                                                                                                                                   |
| Time estimate    | No          |                                                                                                                                                                                                                                                                                                                                                                                                           |
| Source           | Auto        | "Library," "Copied," "Written by [teacher]"                                                                                                                                                                                                                                                                                                                                                               |

## 4.4 The GELDS indicator chooser (the single most important UI in the app)

Never show a teacher a tree of 700 codes.

**Three ways in, in this order of prominence:**

1. **Suggested** (default tab) — "Activities like this usually cover:" 4–6 indicators, pre-checked, based on the activity's library tags. Most teachers will accept these and move on. _This is the happy path — optimize for it._
2. **By domain** — five big color tiles → plain-English skill statements for this classroom's age band, with the code small and grey below each one. Checkboxes.
3. **Search** — type "cutting" or "sharing" or "counting," get matching indicators in plain language.

Rules:

- Filter to the classroom's age band by default, with a "show nearby ages" toggle (real classrooms are mixed).
- Show the code, always, in small grey text — teachers need to recognize it for monitoring, and directors need to trust it.
- Cap at ~6 indicators per activity with a gentle nudge: "That's a lot for one activity — pick the 2 or 3 you'll actually watch for."

## 4.5 The activity library

- **Seeded** by us: 300+ activities at launch, ~60 per age band, each pre-tagged with GELDS indicators, written at 6th-grade reading level. This is the reason a center pays. Budget real money and real early-childhood expertise for this content — do not have an AI generate it unreviewed.
- **Center library:** anything a teacher writes is saved and shared across her center.
- **Filters:** age band, domain, indoor/outdoor, materials on hand, group size, prep time.
- **No public/marketplace sharing in v1.** It's a moderation problem you don't need yet.

## 4.6 Coverage checking

A quiet, non-judgmental panel showing:

- Domains covered this week (five chips)
- Domains not yet covered → "Add one" button that opens the library filtered to that domain
- Indicators repeated a lot / not touched this month
- Missing differentiation, if the classroom is flagged as Georgia Pre-K
- For Georgia Pre-K classrooms only: a checklist of the **Operating Guidelines §4.6** / IQ Guide required components (read-alouds ×2 daily with titles and codes, daily phonological awareness, daily large-group literacy, weekly small-group reading, transitions, outdoor play, clock times, 6.5 instructional hours, assessment collection). Show as a progress list, not as errors.

Never block saving. Never say "invalid." Nudge, then get out of the way.

## 4.7 Output

- **Print view** — clean one-page-per-week PDF, big type, codes included, fits the DECAL required components. This is what goes on the classroom wall and in the monitoring binder.
- **Parent view** — same week with codes stripped and a friendly "What we're learning" line per day. Shareable as a link or PDF.
- **Supply list** — materials rolled up across the week, checkbox format, printable Friday for the next week.
- **Archive** — every plan kept, searchable by week and theme, exportable as a date-range PDF for a monitoring visit.

---

# PART 5 — MODULE B: THE CHILD CRM

Frame it to users as **"the Child Record"** and **"the Child Passport."** Never use the word CRM in the UI — it means nothing to a teacher.

## 5.1 The idea

Everything known about a child lives in one place. When she moves from Toddler 2 to Pre-K in August, her record moves with her and the new teacher gets a **one-page handoff summary** instead of a shrug.

## 5.2 What's on a child record

**Tab 1 — Basics** (director-maintained)
Name, preferred name and how to say it, date of birth, photo, current classroom, enrollment date, schedule (days/hours), home language, languages spoken at home, and the **photo consent toggle** (set at enrollment; drives everything shareable).

**Tab 2 — People**
Guardians with relationship, phone, email, address. Authorized pickups with photo. Emergency contacts. **Do-not-release / custody flags** — this needs to be impossible to miss: red banner at the top of the record and on the classroom roster. Court documents attachable, director-only visibility.

**Tab 3 — Health & Safety** (highest-liability section)

- Allergies — **severity flagged**, with the response plan, surfaced on the roster and at meal time
- Medical conditions, medications with dosage and authorization
- Doctor, dentist, preferred hospital
- **Form 3231** (Certificate of Immunization) — must be on file within **30 calendar days** of program start; a child without one after 30 days may not return until it's provided. Must be replaced within 30 days after expiration.
- **Form 3300** (Vision, Hearing, Dental & Nutrition Screening) — required for Pre-K. Must be on file within **90 calendar days** of program start, and the screenings must have been conducted **within the 12 months prior** to program start. **Different deadline from the 3231 — do not use one countdown for both, or the app will fire false alarms.**
- **Neither form may be required as a condition of enrollment.** DECAL explicitly prohibits this. A valid appointment card keeps the child enrolled past either deadline. So: track, remind, and show status — but **never build a hard block that prevents enrolling a child**. Four states: `missing`, `appointment card on file`, `on file`, `expired`.
- Track expiration dates, not just presence.
- Other required forms per DECAL Rules 591-1-1 (Child Care Learning Centers) — verify the current list against the rules document, dated July 1, 2025 or later, before launch.

**Tab 4 — Learning** (the part that makes it more than a filing cabinet)

- Observations: short notes with optional photo, tagged to GELDS indicators
- A **skills view**: which indicators this child has been observed on, how recently, in what domain
- Goals: 1–3 plain-language things this child is working on
- Work samples (photos of art, writing, block structures)
- **Not a formal assessment or screening instrument.** No scores, no percentiles, no developmental-delay determination. It's documentation. **Print this exact sentence at the top of the Learning tab:** _"These are notes about what teachers have seen. This is not a test or a screening."_

**Tab 5 — Notes & Family**
Family conference notes, family strengths and preferences, what works for this child (calming strategies, routines, comfort items), notes from previous teachers.

**IEP / IFSP:** a presence flag, an attached document (director-only), **and a short list of goal statements** entered by the director. The goals list is what the lesson planner's differentiation field picks from — a flag alone gives the planner nothing to link to. Director-only visibility, same as the document.

## 5.3 Capturing an observation — must be under 30 seconds

Big **+ Observe** button on the classroom roster.

1. Tap the child's photo (or several photos for a group observation)
2. Take a photo, or skip
3. Say or type one line: "Maya counted the blocks to 12 without help"
4. App suggests 2–3 GELDS indicators from the text; teacher taps to confirm or ignores
5. Save — done

Optional voice-to-text. Autosaves as a draft the moment you start. Works offline and syncs when wifi returns.

## 5.4 The Child Passport (the room-to-room handoff)

One printable/viewable page, auto-generated:

- Photo, name, how to say it, birthday, age
- **Red-flag box:** allergies, medical, custody restrictions
- Home language and useful family context
- Top 5 things a new teacher should know (pulled from "what works for this child")
- Learning snapshot: domains with recent observations, current goals, 3 recent work samples
- Who to call
- Signed off by the previous teacher when a child is promoted

**The promotion flow:** Director moves child from Room A to Room B → new teacher gets a task "Review Maya's passport" → old teacher gets "Add anything the next teacher should know" → both check off. Two taps each. This single feature is worth the subscription to a director, because right now this handoff happens verbally in a hallway or not at all.

## 5.5 Roster view

The default screen for a teacher: her classroom, photo grid, allergy and custody icons visible on the tiles, tap any child for the record, big **+ Observe** button, count of children present.

---

# PART 6 — DATA MODEL

```
Organization (the company that owns centers)
 └── Center (a physical licensed location; has DECAL license #)
      ├── Classroom (name, age band, capacity, routine template, is_ga_prek flag)
      │    ├── Enrollment (child ↔ classroom ↔ date range)  ← history, not just current
      │    └── LessonPlan (week_start, theme, status, created_by)
      │         └── PlanSlot (routine_row, day) → Activity
      │              └── ActivityIndicator (activity ↔ gelds_indicator)
      ├── Staff (user ↔ center ↔ role)
      └── Child
           ├── Guardian / AuthorizedPickup / EmergencyContact
           ├── HealthRecord (allergies, conditions, meds)
           ├── ComplianceDoc (type, on_file, issued_date, expires_date, file)
           ├── Observation → ObservationIndicator (obs ↔ gelds_indicator)
           ├── Goal
           ├── Note (typed: conference, behavior, family, handoff)
           └── Document (IEP, custody order, etc. — restricted visibility)

Reference (read-only, versioned):
GeldsDomain → GeldsStrand → GeldsStandard → GeldsIndicator (code, age_band, text)

Library:
ActivityTemplate (global or center-scoped) → suggested indicators, materials, age bands
```

**Non-negotiable data rules:**

- Every row carries `center_id`. Every query filters on it. Row-level security enforced at the database, not just the app.
- `Enrollment` is dated history — a child's record spans classrooms and years. Never overwrite the classroom on the child row.
- Observations and lesson plans are **immutable after 30 days** (soft-lock, director can unlock). They're compliance evidence.
- Full audit log on: child record views, health data changes, document downloads, deletions.
- Soft delete only. Nothing hard-deletes without a director confirmation and a retention window.

---

# PART 7 — ROLES AND PERMISSIONS

|                                      | Teacher | Lead Teacher | Director | Org Admin |
| ------------------------------------ | ------- | ------------ | -------- | --------- |
| View own classroom roster            | ✓       | ✓            | ✓        | ✓         |
| View other classrooms                |         |              | ✓        | ✓         |
| Create/edit own lesson plans         | ✓       | ✓            | ✓        | ✓         |
| Post / unpost a lesson plan          | ✓       | ✓            | ✓        | ✓         |
| Add observations                     | ✓       | ✓            | ✓        | ✓         |
| View child health & allergies        | ✓       | ✓            | ✓        | ✓         |
| Edit child health record             |         | ✓            | ✓        | ✓         |
| View custody documents / IEPs        |         |              | ✓        | ✓         |
| Enroll / promote / withdraw children |         |              | ✓        | ✓         |
| Add / remove staff                   |         |              | ✓        | ✓         |
| Add centers, billing                 |         |              |          | ✓         |

Keep it at four roles. Every custom permission scheme you add is a support ticket forever.

**No approval workflow.** `LessonPlan.status` is `draft | posted`, nothing more. A director _sees_ which classrooms have posted next week's plan; she does not gate it. Requiring her sign-off makes her the bottleneck, which §2.2 says is the thing to avoid.

**Handoff exception to classroom scoping:** a teacher keeps read and write access to a child for **14 days after** that child leaves her room, so she can complete the passport sign-off in §5.4. Without this, promotion silently locks the old teacher out of the very task the app assigns her.

---

# PART 8 — PRIVACY, SECURITY, COMPLIANCE

This app holds children's names, photos, health data, and home addresses. Treat it accordingly.

- **Encrypt at rest and in transit.** No exceptions, including photos.
- **Photos are the biggest liability.** Photo consent is a per-child flag set at enrollment. If consent is off, the child cannot appear in any shared or parent-visible photo. Enforce in code, not policy.
- **FERPA** applies to Georgia Pre-K programs operated by school systems, and possibly others. Build to FERPA-grade access control regardless: least privilege, audit logs, parent right to inspect their own child's record.
- **COPPA** — children don't have accounts. Keep it that way in v1. The moment a child logs in, the compliance surface changes completely.
- **Data ownership:** the center owns its data. Contractual commitment plus a working one-click full export (CSV + PDFs). Say this on the sales page — directors have been burned by other vendors.
- **Retention:** Georgia licensing rules specify how long child records must be kept after withdrawal. Look this up in DECAL Rules 591-1-1 and build the retention timer to match, then offer archive-and-purge.
- **Breach plan** written before launch, not after.
- **Sub-processors:** minimize. Every AI feature that sends child data to a third-party model needs an explicit, documented, opt-in-per-center decision. Default to processing observation text for indicator suggestions **without** sending names — strip identifiers first.
- **Do not build:** facial recognition, behavior scoring, developmental-delay prediction, or anything that produces a label that could follow a child. These are ethically fraught, legally exposed, and will lose you deals with thoughtful directors.

---

# PART 9 — TECH STACK AND BUILD ORDER

## 9.1 Recommended stack (optimized for an AI-assisted solo/small build)

- **Frontend:** Next.js + React + Tailwind, deployed on Vercel
- **Backend/DB:** Supabase (Postgres, auth, row-level security, file storage) — RLS gives you multi-tenant isolation at the database layer with far less code
- **Offline:** PWA with a local cache; queue writes and sync. Build this in from the start for observations and lesson plans — retrofitting offline is brutal.
- **PDF generation:** server-side, from the same React components as the screen view
- **Payments:** Stripe, per-center subscription
- **Email/SMS:** one provider, for expiration reminders and passwords

If **Part 0.5** says teachers have reliable wifi everywhere, you may drop offline from v1 — but confirm it by walking the building, not by asking. Until Part 0.5 is filled in and verified on site, **offline is required** and the build docs treat it as mandatory.

## 9.2 Build order

**Phase 0 — Foundations (before any feature)**
Auth, org/center/classroom/child schema, RLS policies, roles, GELDS reference data loaded and queryable, one seeded demo center.

**Phase 1 — Lesson Planner (this is the wedge; ship it alone if you must)**
Weekly grid, activity editor, indicator chooser, coverage bar, seeded library, print view, archive.
_Ship to 3 pilot centers. Watch a real teacher use it without helping her. Fix what she stumbles on._

**Phase 2 — Child Records**
Roster, child record tabs 1–3, compliance document tracking with expiration reminders, print-a-face-sheet.

**Phase 3 — Observations & Passport**
30-second observation capture, indicator tagging, skills view, goals, passport generation, promotion flow.

**Phase 4 — Director tools**
Dashboard, plan-status-by-classroom, monitoring evidence export, staff management, **subscription billing (we charge the center — Stripe)**.

**Phase 5 — Parents**
Read-only child link, weekly parent lesson view, photo sharing gated on consent.

**Everything else** — attendance, meals, **tuition billing (the center charging parents)**, scheduling, messaging — is Phase 6+ and only if pilots demand it. There are large incumbents in that space; do not fight them there. Win on GELDS-native planning and the room-to-room handoff, which they do badly.

## 9.3 The marketing website

Five pages, no more: Home, How it works, Pricing, About/Why we built it, Book a demo. The hero has to say what it is in one sentence a director understands: _"Weekly lesson plans with GELDS codes already on them — in 15 minutes, not 2 hours."_ Include a real screenshot above the fold and a 90-second video of a teacher actually building a plan.

---

# PART 10 — ACCEPTANCE CRITERIA FOR v1

Test with real teachers at a pilot center, not with yourself.

1. A teacher who has never seen the app builds a complete, GELDS-tagged, five-domain weekly lesson plan in **under 20 minutes** with no help.
2. She never types a GELDS code.
3. The printed plan contains every component required by DECAL's Pre-K Operating Guidelines §4.6 **and the IQ Guide for Planning Instruction**, verified field by field against both plus the current DECAL template.
4. **A former Pre-K Specialist or an experienced Pre-K director scores one of our printed plans against the IQ Guide and passes it.** This is a paid outside review, not a self-check, and it gates launch for Pre-K centers.
5. A child with no Form 3231 or 3300 on file can still be fully enrolled and appear on the roster; the app shows status and reminders but never blocks.
6. A teacher records an observation with a photo and at least one indicator in **under 30 seconds**.
7. Turn wifi off. Do criteria 1 and 6. Turn wifi on. Nothing is lost.
8. A director sees at a glance which of her classrooms have next week's plan posted.
9. A director prints a monitoring packet — 4 weeks of plans for one classroom — in under 60 seconds.
10. A child promoted from one room to another produces a passport the new teacher rates as genuinely useful — and the **previous** teacher can still sign it off after the move.
11. An allergy is visible on the roster tile without opening the child's record.
12. A teacher cannot see another classroom's children; verified by attempting it directly against the API, not just the UI.
13. A child with photo consent off never appears in any parent-visible or shared photo, verified against the API.
14. Every screen is usable one-handed on a 5-inch phone.
15. All UI copy reads at 6th-grade level or below (run it through a readability checker).
16. CD indicators (`CD-MA`, `CD-SC`, `CD-SS`, `CD-CR`, `CD-CP`) import, display, print, and search correctly — this is the code shape most likely to be silently broken.

---

# PART 11 — OPEN QUESTIONS TO RESOLVE

1. **DECAL permission** for commercial use and redistribution of GELDS standards text — write and get it in writing. Blocking.
2. Obtain the current DECAL Pre-K lesson plan template, the _FAQ for Planning Instruction_, and the **IQ Guide for Planning Instruction** (`AppendixT_IQ_GuideforPlanningInstruction.docx`), and check our template field-by-field. Blocking for Pre-K centers. Note the FAQ served on decal.ga.gov may show a "Last Updated 7/2024" footer even though a 7/2025 revision is indexed — confirm you have the current one.
3. Exact child-record retention period under Rules 591-1-1 (current version, July 2025 or later).
4. Does WSO offer any import path, or is copy-paste the only bridge?
5. Will you pursue any formal Quality Rated alignment or endorsement, or just make the evidence easy to produce?
6. Spanish UI at launch or later? Significant portion of Georgia's ECE workforce and families.
7. Who writes the 300 seeded activities, and what does that cost?
8. Confirm the CD subdomain code shape (§3.1a) against the full GELDS export for **every** age band before the importer is written — verified so far against the 48–60 month PDF only.
9. Who is the paid outside reviewer for acceptance criterion 4, and what do they charge?

---

## Companion documents

- **`BUILD-INSTRUCTIONS-claude-code.md`** — engineering brief. Stack, schema, row-level security, ticketed build order.
- **`DESIGN-BRIEF.md`** — visual language, design tokens, component system, screen specs, print designs, marketing site.

This file is the source of truth. If either companion contradicts it, this file wins.

---

## Sources

- [GELDS — Georgia Early Learning and Development Standards (DECAL)](https://gelds.decal.ga.gov/)
- [GELDS Overview — domains, code structure, age bands](https://gelds.decal.ga.gov/Resource/GELDSOverview)
- [GELDS Standards & Indicators](https://gelds.decal.ga.gov/GELDS)
- [DECAL — Georgia Early Learning and Development Standards](https://www.decal.ga.gov/Prek/GELDS.aspx)
- [Georgia's Pre-K Providers' Operating Guidelines 2026–2027](https://www.decal.ga.gov/documents/attachments/guidelines.pdf)
- [FAQ for Planning Instruction (DECAL, 7/2025)](https://www.decal.ga.gov/documents/attachments/FAQ_Planning_Instruction.pdf)
- [Off to a Good Start — lesson planning handbook for Georgia's Pre-K teachers](https://www.decal.ga.gov/documents/attachments/OfftoaGoodStart.pdf)
- [Georgia's Pre-K Work Sampling System Assessment Program](https://www.decal.ga.gov/prek/PreKChildAssessmentProgram.aspx)
- [Rules and Regulations for Child Care Learning Centers, Chapter 591-1-1 (July 1, 2025)](https://www.decal.ga.gov/documents/attachments/cclcrulesandregulations.pdf)
- [DECAL Immunization Requirements tip sheet (Form 3231)](https://www.decal.ga.gov/documents/attachments/tipofmonthimmunizationstip.pdf)
- [Georgia DPH Form 3231 — Certificate of Immunization](https://dph.georgia.gov/document/form/blank3231sample2020pdf/download)
- [Quality Rated Program Manual](https://qualityrated.decal.ga.gov/Content/Documents/PM_ProgramManual.pdf)
- [Quality Rated — DECAL](https://www.decal.ga.gov/qualityinitiatives/qualityrated.aspx)
