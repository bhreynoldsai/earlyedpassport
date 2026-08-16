# The GELDS data we loaded is the wrong edition

**Found 2026-08-16, after Bernard supplied a live-portal snapshot.**
**This needs a decision before Phase 1 builds the indicator chooser on top of it.**

---

## What happened

T-0.6 imported 657 indicators from DECAL's five age-band PDFs at
`gelds.decal.ga.gov/pdf/indicators/`. Those PDFs are footed
**"©Bright from the Start 2013"** — they are the original 2013 edition.

The **live GELDS portal** at `gelds.decal.ga.gov/GELDS` carries a newer
inventory: **680 records, 679 unique codes.**

I verified this independently rather than taking the supplied workbook on
trust — fetching the portal's own all-ages search endpoint directly returns
exactly 680 records and 679 unique codes, matching the workbook precisely.
Codes the workbook says exist do exist; codes it says are gone are gone.

## The size of the gap

|                                            |        |
| ------------------------------------------ | ------ |
| Imported from the 2013 PDFs                | 657    |
| On the live portal                         | 679    |
| **In the portal, missing from our import** | **71** |
| **In our import, retired from the portal** | **49** |

This is not a parsing defect. The parse was clean and cross-checked. It is two
different editions of the standards.

### Where it moved

**Added:** `CD-MA6` +13 · `CLL7` +13 · `CD-MA8` +10 (new) · `CD-MA10` +9 (new)
· `CLL4` +5 · `CLL5` +5 · `CLL6` +4 · `CD-MA9` +2 (new)

**Retired:** `CLL8` −14 · `CD-MA3` −11 · `CD-MA4` −5 · `CD-MA1` −4 ·
`CD-MA5` −4 · `CD-MA7` −4

No standard disappeared outright, but two were pruned hard: **CLL8 went from 20
indicators to 6** and **CD-MA3 from 18 to 7**. Those are the standards where a
teacher is most likely to reach for a code she used last year and find it gone.

## Why this matters more than the numbers suggest

**Phonological awareness is the worst of it.** Georgia Pre-K requires **at least
one phonological awareness activity every day**, and it is scored.

|                            | CLL7 indicators                         |
| -------------------------- | --------------------------------------- |
| 2013 PDFs (what we loaded) | **3** — `CLL7.2a`, `CLL7.3a`, `CLL7.4a` |
| Live portal                | **16**                                  |

On the edition we loaded, a Pre-K teacher planning five daily phonological
awareness activities has _one_ indicator available at her age band. She would
attach `CLL7.4a` to all five days. That looks exactly like the box-ticking the
IQ Guide is designed to catch — and it would be our data forcing her into it.

**DECAL's own sample lesson plans are stale too.** Of the 122 codes on the five
sample plans Bernard supplied, **10 no longer exist on the portal** —
`CD-MA1.2d`, `CD-MA3.0a`, `CD-MA3.0b`, `CD-MA4.0b`, `CD-MA4.2c`, `CD-MA4.3c`,
`CLL8.0a`, `CLL8.2c`, `CLL8.4d`, `CLL9.0a`. That is independent corroboration
that the portal is the newer source, and a caution that DECAL's published
materials are not uniformly current.

## A third edition is already in flight

The portal itself displays **"GELDS Update in Progress."** DECAL has published:

- a [2026 Pre-K crosswalk](https://www.decal.ga.gov/documents/attachments/CrosswalkPreKGELDSalldomains.pdf) from the 2013 standards to current 2026 Pre-K standards
- [revised 2026 Pre-K CLL indicators](https://www.decal.ga.gov/documents/attachments/CLLGELDSINDICATORS_Pre-K.pdf) that include a **CLL10** standard
- an [FY27 rollout notice](https://www.decal.ga.gov/documents/attachments/FY27GELDSCLLRollOutone.pdf) stating all GELDS were reviewed and revised, and that Georgia Pre-K begins with the revised CLL after training

**CLL10 does not appear on the live portal** — I checked. So there are three
editions in play at once:

1. **2013** — the age-band PDFs. What we loaded.
2. **The live portal** — transitional, 679 codes, mid-update.
3. **2026 Pre-K** — partially published, CLL first, rolling out FY27.

This is precisely why `gelds_version` exists on every row and why every attached
code carries a version snapshot. A plan printed against one edition must keep
showing what it showed.

## Two defects this exposes in what we shipped

**1. Our version label is wrong.** `GELDS_VERSION` is `'2013-rev-2024'`. The
data is the 2013 edition and I invented the `rev-2024` part. It should say what
it is.

**2. The portal would fail our duplicate gate.** `CLL1.0b` appears **twice** on
the portal, under source ids 237 and 238, with different wording —
_"Responds to simple directions"_ and _"Responds to repeated words and
phrases."_ Our hard gate rejects duplicate `full_code` within a version, and the
database has a matching unique constraint.

The gate is not wrong; DECAL's data is inconsistent. But we have to choose:
carry the portal's source id as part of the key, drop one record, or keep the
gate and refuse the portal until DECAL fixes it. Silently picking one would
mean a teacher sees an indicator whose wording we chose for her.

## What was decided — 2026-08-16

**Switched to the live portal.** Bernard's call.

- `supabase/gelds/portal.ts` parses DECAL's HTML directly. It does not depend
  on the supplied workbook — that was the tip-off, not the source.
- **679 indicators**, all hard gates passed. The portal's own "Total Records"
  count is cross-checked against the number parsed, so a truncated fetch fails
  rather than importing quietly.
- The 2013 set is **kept, relabelled `2013`**, not deleted. Both editions live
  in `gelds_indicator` under different `gelds_version` values, and a test proves
  the same code can carry different wording in each. Plans printed against 2013
  keep rendering as printed.
- `CURRENT_GELDS_VERSION` is now `portal-2026-08-16`. The invented
  `2013-rev-2024` label is gone.
- `CLL1.0b`: source id **237** kept (_"Responds to simple directions"_), id 238
  dropped. The duplicate gate stays **hard** — this passes only via an explicit
  `KNOWN_DUPLICATES` entry that names the code, the id kept and the reason.
  Anything not on that list still fails the import outright.

The portal parser is also **less fragile than the PDF path** — no bounding
boxes, no vertically-centred table cells, no wrapped headings.

### Still to do

**Raise `CLL1.0b` with DECAL** when you write about permission. Two different
indicators share one code on their live portal; they will want to know, and it
saves us guessing which one a specialist expects.

**Track the 2026 Pre-K revision.** CLL is published and includes `CLL10`, which
is _not_ yet on the portal. When DECAL finishes, this becomes a third edition
and the version machinery is already in place to carry it.
