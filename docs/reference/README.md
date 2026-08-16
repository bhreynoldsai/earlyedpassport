# Reference documents — drop files here

Bernard: this is where the source documents go. Drop a file into the right
subfolder, keep the suggested filename if you can, and tick the box below. You
do not need to tell me anything else — the filename and folder are enough.

**Do not put anything with real child data in this repo.** Not a filled-in Form
3231, not a roster, not a photo of a classroom wall with names on it. Blank
templates only. If a document you need to share has a real child's information
on it, tell me and we will find another way to get it to me.

---

## `decal/` — DECAL programme documents

These define what a compliant lesson plan has to contain. T-1.9 and T-1.10 get
reconciled field-by-field against them.

| Drop this                                | Suggested filename                   | Why it matters                                                                                               | Have it? |
| ---------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------ | -------- |
| **IQ Guide for Planning Instruction**    | `iq-guide-planning-instruction.docx` | The instrument a Pre-K Specialist actually scores against. This one outranks every summary in our own specs. | ☐        |
| Current DECAL Pre-K lesson plan template | `prek-lesson-plan-template.<ext>`    | We check our print output field-by-field against it                                                          | ☐        |
| FAQ for Planning Instruction             | `faq-planning-instruction.pdf`       | Confirm you have the 7/2025 revision — the served PDF may still show a 7/2024 footer                         | ☐        |
| Pre-K Providers' Operating Guidelines    | `prek-operating-guidelines.pdf`      | §4.6 is the required-components list                                                                         | ☐        |
| Rules & Regulations 591-1-1              | `cclc-rules-591-1-1.pdf`             | Retention period, and the full required-forms list                                                           | ☐        |

The IQ Guide is published as `AppendixT_IQ_GuideforPlanningInstruction.docx` even
though the guidelines body text calls it Appendix N. That inconsistency is
DECAL's, and it is why the file is hard to find.

### `decal/sample-plans/` — received ✅

Five DECAL sample lesson plans, one per age band. These turned out to be worth
more than expected: they carry **122 real GELDS codes**, which now live in
`tests/fixtures/decal-sample-plan-codes.ts` as a conformance suite. Every one of
them parses, all five domains and all five CD subdomains appear, and the CD code
shape is now confirmed in bands 0, 2, 3 and 4 rather than 48–60 months alone.

| File                                          | Band | Codes | Text layer        |
| --------------------------------------------- | ---- | ----- | ----------------- |
| `BytheFarmLessonPlan_0-12_Months.pdf`         | 0    | 29    | ✅                |
| `FlowersLessonPlan_12-24_Months.pdf`          | 1    | —     | ❌ **image only** |
| `ArcticAnimalsLessonPlan_24-36_Months.pdf`    | 2    | 42    | ✅                |
| `CommunityHelpersLessonPlan_36-48_Months.pdf` | 3    | 25    | ✅                |
| `AnimalsinWinter_LargeGroup_48-60_Months.pdf` | 4    | 27    | ✅                |

**The 12–24 month plan is a scanned image with no text layer**, so nothing could
be extracted from it and band 1 is the one band still unconfirmed. If a
text-layer version exists on decal.ga.gov, replacing this file closes the gap.

---

## `gelds/` — the standards themselves

Source material for the import pipeline (T-0.6). The parse step is fragile and
should run rarely, so these files are the inputs and the committed
`gelds-<version>.json` is the artifact everything else depends on.

| Drop this                                   | Suggested filename               | Why it matters                                                                 | Have it? |
| ------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------ | -------- |
| **GELDS Quick Guide / Quick View**          | `gelds-quick-view.pdf`           | Carries the five domain colours. Blocks design sign-off (`TODO(gelds-colors)`) | ☐        |
| Indicators, 0–12 months                     | `indicators-00-12.pdf`           | Age band 0                                                                     | ☐        |
| Indicators, 12–24 months                    | `indicators-12-24.pdf`           | Age band 1                                                                     | ☐        |
| Indicators, 24–36 months                    | `indicators-24-36.pdf`           | Age band 2                                                                     | ☐        |
| Indicators, 36–48 months                    | `indicators-36-48.pdf`           | Age band 3                                                                     | ☐        |
| Indicators, 48–60 months                    | `indicators-48-60.pdf`           | Age band 4 — the only band the CD code shape is verified against so far        | ☐        |
| A machine-readable export, if DECAL has one | `gelds-export.<csv\|json\|xlsx>` | Would retire most of the parser. Worth asking for.                             | ☐        |

If you only get one file from this list, make it the **Quick Guide** — the five
colours are a ten-minute unblock and every domain chip in the product is
currently grey.

---

## `correspondence/` — the paper trail

| Drop this                                                                | Suggested filename                  | Why it matters                                                                       | Have it? |
| ------------------------------------------------------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------ | -------- |
| **DECAL permission** for commercial use and redistribution of GELDS text | `decal-permission-<yyyy-mm-dd>.pdf` | Blocks launch. Attribution is already in the app, but attribution is not permission. | ☐        |
| Your outgoing request, if you want it on file                            | `decal-request-<yyyy-mm-dd>.pdf`    | Shows we asked and when                                                              | ☐        |
| Outside reviewer's engagement / scope                                    | `reviewer-engagement.pdf`           | Acceptance criterion 4                                                               | ☐        |

When the permission document lands here, that is the moment the
`TODO(decal-permission)` marker comes out of `docs/OPEN-ITEMS.md` — and not
before. `pnpm lint:release` fails a tagged build while it is still there.

---

## What happens after you drop a file

Tell me it's in and I'll pick it up. Concretely:

- **Quick Guide** → I replace the five placeholder colours in `app/globals.css`
  and remove `TODO(gelds-colors)`.
- **Indicator PDFs** → I build the T-0.6 parser against them and give you the
  validation report: counts per domain, per age band, and whether the CD
  subdomain shape holds in every band or only in 48–60.
- **IQ Guide** → I reconcile the printed plan's fields against it and tell you
  what our template is missing.
- **Permission letter** → the release gate comes down.

## A note on file formats

PDFs and Word files are fine. Scans are fine but slow me down — a text-layer PDF
parses cleanly, a photographed page does not. If you have a choice, download the
original from decal.ga.gov rather than printing and re-scanning it.
