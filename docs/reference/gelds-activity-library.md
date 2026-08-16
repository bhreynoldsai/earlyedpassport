# DECAL's GELDS Activity Library — what's there, and what we can use

Source: https://gelds.decal.ga.gov/Activity

Bernard asked me to pull these down as reference. I've documented the structure
and taken a small sample. **I have not bulk-downloaded the corpus** — see
"Permission" below, which is the same blocker we're already tracking.

---

## Structure of one activity

Fetched `/Activity/Detail/1` as a representative record. The fields, exactly as
DECAL labels them:

| Field          | Example                                 |
| -------------- | --------------------------------------- |
| Title          | `"I Spy" Logo Hunt`                     |
| `AGE GROUP(S)` | `48-60 months`                          |
| `DOMAIN(S)`    | `Communication, Language, and Literacy` |
| `INDICATOR(S)` | `CLL5.4e`                               |
| Description    | One short paragraph, teacher-facing     |

Notes that matter for our schema:

- **Age group and domain are both plural.** One activity can span bands and
  domains. Our `activity_template` needs many-to-many on both, not a scalar —
  worth confirming before T-1.11.
- **Materials are not a separate field.** They're prose inside the description.
  Our model has a structured materials list that rolls up into a weekly supply
  list (T-1.13), which is a real improvement over theirs, not just parity.
- **`CLL5.4e` uses indicator letter `e`.** Our pattern allows `a`–`f`, so this
  parses. Good confirmation that the letter range isn't `a`–`d`.
- Browsable at `/Activity/Detail/<id>`, sequential integer ids.
- Filters: five age groups, five domains, A–Z / Z–A sort.

## Access notes

- **No API, no bulk export, no download link.** Content is HTML only.
- Pagination is `/Activity?sortorder=1&page=<n>`, 20 per page. The page furnishes
  no total count, so corpus size is unknown without walking the pager.
- `robots.txt` returns 404 — no declared crawl restrictions. That is _not_ the
  same as permission to redistribute.

## Permission — read this before using any of it

The footer reads: _"© Georgia Department of Early Care and Learning. Georgia
Early Learning and Development Standards."_ There is no terms-of-use or
permitted-use statement on the page.

That puts this content in exactly the same position as the GELDS standards text
we're already blocked on (`TODO(decal-permission)`, `docs/OPEN-ITEMS.md` §1) —
except weaker, because activity descriptions are creative work rather than
factual standards codes, so the fair-use argument is thinner, not thicker.

**What that means concretely:**

- Using these as reference, to design our schema and understand DECAL's
  conventions, is fine and is what this document is.
- **Copying them into our seeded activity library is not**, unless DECAL's
  permission letter covers it. When you write to DECAL, ask about the activity
  library explicitly and separately — a permission to reproduce standards codes
  will not automatically cover activity text.
- `PROJECT-INSTRUCTIONS.md` §4.5 already says our 300 seeded activities need
  real early-childhood expertise and a real budget. That instruction and this
  library point the same way: write our own.

## One strategic thing worth knowing

**DECAL gives this library away free, already GELDS-tagged.** That undercuts the
framing in §4.5 that the seeded activity library "is the reason a center pays" —
a director can already get free tagged activities from the state.

It does not undercut the product. What a center cannot get free is the _planner_:
last week copied forward, codes attaching themselves without anyone typing one,
the five-domain coverage bar, and a print-out that carries every component the
IQ Guide scores. That's the wedge, and it's what the marketing site already
leads with.

The practical consequence: budget the 300 activities as **table stakes**, not as
the differentiator. Spending heavily there buys parity with something free.
