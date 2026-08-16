# Open items — Bernard

These are the decisions and documents that only you can supply. Several of them
gate launch, and no amount of engineering removes them.

Markers in this file are read by `scripts/check-release-blockers.mjs`. They
report on every CI run and **fail a tagged release build**. Delete a marker only
when the underlying item is genuinely resolved.

**Documents go in [`docs/reference/`](reference/README.md)** — that README lists
every file we are waiting on, where to put it, and what I do with it once it
lands. No real child data in this repo, ever.

---

## Blocking launch

### 1. DECAL written permission — `TODO(decal-permission)`

Written permission for commercial use and redistribution of GELDS standards
text. Ask at the same time whether a machine-readable export exists, which would
retire most of the import pipeline's fragility.

Until this lands we may not ship. Attribution is already rendered in the app
footer and is required on every printed plan (`copy.standards.attribution`), but
attribution is not permission.

**Status:** not started.

### 2. The IQ Guide for Planning Instruction

`AppendixT_IQ_GuideforPlanningInstruction.docx` on decal.ga.gov. The guidelines
body text calls it Appendix N; that inconsistency is DECAL's and it makes the
file hard to find.

This document, not the summary in `PROJECT-INSTRUCTIONS.md` §3.3, is what a
Pre-K Specialist actually scores against. Also obtain the current DECAL Pre-K
lesson plan template and the _FAQ for Planning Instruction_ (confirm you have
the 7/2025 revision — the served PDF may still show a 7/2024 footer).

Expect a reconciliation pass on T-1.9 and T-1.10 when it arrives.

**Status:** you said you are obtaining it.

### 3. The paid outside reviewer

A former Pre-K Specialist or experienced Pre-K director, paid, scoring one of
our printed monitoring plans against the IQ Guide. This is acceptance criterion
4 and it gates Pre-K customers. Book it at the **start** of Phase 1, not the
end — the print design in `DESIGN-BRIEF` §5.9 is what they will be scoring, and
a failed review after the build is a rewrite.

**Status:** not booked. Who, and what do they charge?

---

## Blocking design sign-off

### 4. The five DECAL domain colours — `TODO(gelds-colors)`

Pull the exact hex values from the GELDS Quick Guide PDF:
https://gelds.decal.ga.gov/pdf/documents/GELDS_Quick_View.pdf

Record them as `--gelds-pdm`, `--gelds-sed`, `--gelds-apl`, `--gelds-cll`,
`--gelds-cd` in `app/globals.css`. Teachers recognise these colours from their
training posters, so inventing our own costs us recognition we get for free.

All five CD subdomains share the single CD colour and are told apart by label,
not hue.

**Status:** placeholders shipped. Every domain chip is currently grey.

---

## Blocking the marketing site

### 5. Pricing — `TODO(pricing)`

Part 0.2 is blank. Every number on `/pricing` is structure, not a decision. Do
not quote them to a center.

### 6. Real product screenshots — `TODO(marketing-assets)`

`DESIGN-BRIEF` §8 requires a real screenshot of the week grid, on a phone, above
the fold — not an illustration, and no stock photos of children. The home page
currently shows a live coverage bar as a stand-in. Swap it when T-1.4 lands.

Also needed: the 90-second video of an actual teacher building a plan, and one
pilot-director quote.

### 7. The demo form — `TODO(demo-form)`

`/demo` currently tells a director to send an email. There is no form handler
and no destination. A form that silently drops a request is worse than no form,
which is why there is no form yet.

---

## Blocking Phase 0 scope

### 8. Part 0.5 — reliable wifi, verified by walking the building

This one question decides whether the offline queue, service worker, conflict
store and photo upload queue are in Phase 0 or deleted. Until it is answered and
verified **on site**, offline is mandatory.

See `docs/SPEC-REVIEW.md` §2.

### 9. The 300 seeded activities

~60 per age band, each pre-tagged with GELDS indicators, written at 6th-grade
reading level. This is the reason a center pays. It is a content budget and real
early-childhood expertise, not an engineering task, and
`PROJECT-INSTRUCTIONS.md` §4.5 says explicitly not to have an AI generate them
unreviewed.

Who writes them, and what does it cost?

---

## Smaller open questions

- Does the Form 3300 clock restart when a child is promoted between rooms?
  I have assumed **no** (see `docs/SPEC-REVIEW.md` §4).
- May I enable `pg_cron` for the nightly soft-lock job? (`SPEC-REVIEW.md` §6)
- Exact child-record retention period under Rules 591-1-1, July 2025 or later.
- Does Work Sampling Online offer any import path, or is copy-paste the bridge?
- Spanish UI at launch or later? Layouts are already built to survive ~30%
  longer strings either way.
- Confirm the CD subdomain code shape against the full GELDS export for **every**
  age band. It is verified against the 48–60 month PDF only.
- Three pilot centers for the Phase 1 exit gate.
- Domain and trademark clearance for **Early Ed Passport**. `earlyedpassport.com`
  is registered; the name has not been trademark-checked.
