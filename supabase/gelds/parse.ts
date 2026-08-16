/**
 * PDF → intermediate JSON. Ticket T-0.6, step 2.
 *
 * THIS IS THE FRAGILE STEP. It should run rarely — when DECAL revises the
 * standards — and its output (`gelds-<version>.json`) is the committed artifact
 * everything downstream depends on. Nothing else in the codebase parses a PDF.
 *
 * Requires `pdftotext` (poppler-utils) on PATH.
 *
 * ## Why word positions and not plain text
 *
 * DECAL's indicator tables put the code in a narrow left column and the text in
 * a wide right column. When the text wraps to two lines the code is rendered
 * *vertically centred*, so in reading order it lands BETWEEN the two halves of
 * its own sentence:
 *
 *     Actively participates in a variety of both structured and unstructured
 *     PDM1.4b
 *     activities for a sustained period that increase strength and flexibility.
 *
 * 98 of ~660 indicators do this, and it is worst in the 48-60 month band that
 * Pre-K classrooms actually use. A line-oriented parser silently attaches the
 * first half of the sentence to the PREVIOUS indicator — which is exactly the
 * class of bug that puts wrong wording on a monitoring document.
 *
 * So we read `pdftotext -bbox-layout`, which gives every line a bounding box,
 * and assign body text to whichever code's cell it falls inside. A cell runs
 * from the midpoint between this code and the one above it, to the midpoint
 * between this code and the one below. Because the code is centred in its cell,
 * those midpoints land in the gaps between rows.
 */

import { execFileSync } from 'node:child_process'
import { formatFullCode, parseFullCode } from '@/lib/gelds/code'
import {
  CD_SUBDOMAIN_CODES,
  DOMAIN_CODES,
  type AgeBand,
  type CdSubdomainCode,
  type DomainCode,
} from '@/lib/gelds/constants'

export interface RawIndicator {
  geldsVersion: string
  domainCode: DomainCode
  subdomainCode: CdSubdomainCode | null
  strandName: string | null
  standardNumber: number
  standardText: string | null
  ageBand: AgeBand
  indicatorLetter: string | null
  fullCode: string
  indicatorText: string
  /** Provenance, so a wrong row can be traced back to a page. */
  sourceFile: string
  sourcePage: number
}

interface PositionedLine {
  text: string
  yCenter: number
  xMin: number
  xMax: number
  /** Width of the page this line sits on, for the centred-heading test. */
  pageWidth: number
}

/**
 * Does this heading look finished?
 *
 * Headings wrap, and a wrapped heading's second line can start close enough to
 * the indicator column to fool a left-edge test. Position alone cannot separate
 * them — 22 real indicator lines happen to sit near the page centre too. What
 * does separate them is the sentence: DECAL's headings are complete sentences,
 * so a heading ending mid-clause has a continuation line and one ending in a
 * full stop does not.
 */
function headingLooksComplete(text: string): boolean {
  return /[.!?]$/.test(text.trim())
}

/** A wrapped heading never runs past this many extra lines. */
const MAX_HEADING_CONTINUATION_LINES = 2

/**
 * Half-height assumed for a page's only indicator cell, in points. Generous
 * enough to hold a four-line indicator, tight enough to exclude the heading
 * block above it.
 */
const DEFAULT_HALF_CELL = 46

/**
 * The left edge of the indicator-text column on a page.
 *
 * Standard headings wrap too, and a wrapped heading's second line is *centred*
 * while indicator text is *left-aligned in a fixed column*. Without this, the
 * tail of "Standard CD-MA1: The child will organize, represent, and / build
 * knowledge of quantity and number." gets glued onto the front of CD-MA1.4a's
 * wording — wrong text, on a code a director will read off a monitoring
 * document.
 *
 * Found as the densest cluster of left edges rather than the mode, because
 * poppler's x values jitter a point or two between lines.
 */
function bodyColumnLeft(candidates: readonly PositionedLine[]): number | null {
  if (candidates.length === 0) return null
  const xs = candidates.map((l) => l.xMin)
  let best = xs[0]!
  let bestCount = 0
  for (const x of xs) {
    const count = xs.filter((other) => Math.abs(other - x) <= COLUMN_TOLERANCE).length
    if (count > bestCount) {
      bestCount = count
      best = x
    }
  }
  return best
}

/** Points of horizontal jitter tolerated when deciding if a line is in-column. */
const COLUMN_TOLERANCE = 14

const CODE_TOKEN = /^(?:(?:PDM|SED|APL|CLL)|CD-(?:MA|SC|SS|CR|CP))\d{1,2}\.\d[a-f]?$/
const CODE_LEADING = /^((?:(?:PDM|SED|APL|CLL)|CD-(?:MA|SC|SS|CR|CP))\d{1,2}\.\d[a-f]?)\s*(.*)$/

/**
 * `Cognitive Development: MATHEMATICS (CD-MA)` / `Approaches to Play and Learning (APL)`
 * and the continuation form a domain gets when its table spills onto a new
 * page: `Cognitive Development: Mathematics (CD-MA) - Continued`.
 */
const DOMAIN_HEADER = /\((PDM|SED|APL|CLL|CD-(?:MA|SC|SS|CR|CP))\)(?:\s*[-–—]\s*Continued)?\s*$/i
const STRAND_HEADER = /^STRAND:\s*(.+)$/i
const STANDARD_HEADER =
  /^Standards?\s+((?:PDM|PD|SED|SE|APL|CLL|CD-(?:MA|SC|SS|CR|CP))\d{1,2})\s*:\s*(.*)$/i

/** Page furniture that must never become indicator text. */
const FURNITURE = [
  /^©?\s*Bright from the Start/i,
  /^Page\s+\d+$/i,
  /^Georgia Early Learning and Development Standards$/i,
  // DECAL alternates between a hyphen and an en dash in this running head.
  /^GELDS\s*[-–—]\s*[\d\s-–—]+\s*Months?$/i,
  /^Continued on next page/i,
]

/** `(no CLL6.3c)` — DECAL flagging an intentional hole in their numbering. */
const GAP_NOTE =
  /^\(\s*no\s+((?:(?:PDM|SED|APL|CLL)|CD-(?:MA|SC|SS|CR|CP))\d{1,2}\.\d[a-f]?)\s*\)$/i

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

/** Normalises the typographic quotes and dashes Word emits. */
function normalise(s: string): string {
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/–/g, '–')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Extract `<page>` → `<line>` with positions, from `pdftotext -bbox-layout`. */
function readPositionedLines(pdfPath: string): PositionedLine[][] {
  const xhtml = execFileSync('pdftotext', ['-bbox-layout', pdfPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })

  const pages: PositionedLine[][] = []
  for (const pageChunk of xhtml.split('<page ').slice(1)) {
    const lines: PositionedLine[] = []
    const pageWidth = Number(/^width="([\d.]+)"/.exec(pageChunk)?.[1] ?? 612)
    const lineRe =
      /<line xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([\s\S]*?)<\/line>/g
    let m: RegExpExecArray | null
    while ((m = lineRe.exec(pageChunk)) !== null) {
      const [, xMinRaw, yMinRaw, xMaxRaw, yMaxRaw, inner] = m
      const words = [...(inner ?? '').matchAll(/<word [^>]*>([\s\S]*?)<\/word>/g)].map((w) =>
        decodeEntities(w[1] ?? '')
      )
      const text = normalise(words.join(' '))
      if (!text) continue
      lines.push({
        text,
        yCenter: (Number(yMinRaw) + Number(yMaxRaw)) / 2,
        xMin: Number(xMinRaw),
        xMax: Number(xMaxRaw),
        pageWidth,
      })
    }
    lines.sort((a, b) => a.yCenter - b.yCenter)
    pages.push(lines)
  }
  return pages
}

function isFurniture(text: string): boolean {
  return FURNITURE.some((re) => re.test(text))
}

interface CodeAnchor {
  fullCode: string
  yCenter: number
  inlineText: string
  page: number
  /**
   * Domain, subdomain and strand as they stood WHEN THIS CODE WAS READ.
   *
   * These must be snapshotted per anchor, not read after the page loop
   * finishes. A page carries several strands, so reading them at the end gives
   * every indicator on the page the last strand on that page — silently wrong
   * metadata on roughly half the table.
   */
  domainCode: DomainCode | null
  subdomainCode: CdSubdomainCode | null
  strandName: string | null
}

export interface ParseWarning {
  file: string
  page: number
  message: string
}

export interface ParseResult {
  indicators: RawIndicator[]
  warnings: ParseWarning[]
}

/**
 * Parse one age-band PDF.
 *
 * Everything that looks wrong but is not fatal becomes a warning rather than a
 * throw — the validator decides what fails the run, so that one pass reports
 * every problem instead of stopping at the first.
 */
export function parseAgeBandPdf(
  pdfPath: string,
  fileLabel: string,
  ageBand: AgeBand,
  geldsVersion: string
): ParseResult {
  const pages = readPositionedLines(pdfPath)
  const indicators: RawIndicator[] = []
  const warnings: ParseWarning[] = []

  // Domain, subdomain, strand and standard carry across pages.
  let domainCode: DomainCode | null = null
  let subdomainCode: CdSubdomainCode | null = null
  let strandName: string | null = null
  const standardTextByNumber = new Map<string, string>()

  pages.forEach((lines, pageIndex) => {
    const pageNo = pageIndex + 1
    const anchors: CodeAnchor[] = []
    const body: PositionedLine[] = []

    // Establish the text column from the lines that are neither codes nor
    // recognisable headings, then use it to tell indicator text apart from a
    // heading that wrapped onto a second, centred line.
    const columnCandidates = lines.filter(
      (l) =>
        !isFurniture(l.text) &&
        !DOMAIN_HEADER.test(l.text) &&
        !STRAND_HEADER.test(l.text) &&
        !STANDARD_HEADER.test(l.text) &&
        !CODE_LEADING.test(l.text)
    )
    const columnLeft = bodyColumnLeft(columnCandidates)

    /**
     * A heading whose sentence is unfinished, and so is still expecting its
     * next line. Cleared as soon as the sentence completes or a code appears.
     */
    let openHeading:
      (({ kind: 'standard'; key: string } | { kind: 'strand' }) & { linesLeft: number }) | null =
      null

    for (const line of lines) {
      if (isFurniture(line.text)) continue

      const domainMatch = DOMAIN_HEADER.exec(line.text)
      if (domainMatch) {
        const token = domainMatch[1]!
        if (token.startsWith('CD-')) {
          domainCode = 'CD'
          subdomainCode = token.slice(3) as CdSubdomainCode
        } else {
          domainCode = token as DomainCode
          subdomainCode = null
        }
        strandName = null
        openHeading = null
        continue
      }

      const strandMatch = STRAND_HEADER.exec(line.text)
      if (strandMatch) {
        strandName = normalise(strandMatch[1]!)
        openHeading = headingLooksComplete(strandName)
          ? null
          : { kind: 'strand', linesLeft: MAX_HEADING_CONTINUATION_LINES }
        continue
      }

      const standardMatch = STANDARD_HEADER.exec(line.text)
      if (standardMatch) {
        const key = standardMatch[1]!.toUpperCase()
        const headText = normalise(standardMatch[2] ?? '')
        standardTextByNumber.set(key, headText)
        openHeading = headingLooksComplete(headText)
          ? null
          : { kind: 'standard', key, linesLeft: MAX_HEADING_CONTINUATION_LINES }
        continue
      }

      const codeMatch = CODE_LEADING.exec(line.text)
      if (codeMatch && CODE_TOKEN.test(codeMatch[1]!)) {
        anchors.push({
          fullCode: codeMatch[1]!,
          yCenter: line.yCenter,
          inlineText: normalise(codeMatch[2] ?? ''),
          page: pageNo,
          domainCode,
          subdomainCode,
          strandName,
        })
        openHeading = null
        continue
      }

      // Out of column and a heading is still open → this is that heading's
      // second line, not indicator text.
      const inColumn = columnLeft === null || Math.abs(line.xMin - columnLeft) <= COLUMN_TOLERANCE

      // The heading above is mid-sentence, so this line finishes it rather than
      // being indicator text.
      if (openHeading && openHeading.linesLeft > 0) {
        let completed: string
        if (openHeading.kind === 'standard') {
          completed = normalise(`${standardTextByNumber.get(openHeading.key) ?? ''} ${line.text}`)
          standardTextByNumber.set(openHeading.key, completed)
        } else {
          completed = normalise(`${strandName ?? ''} ${line.text}`)
          strandName = completed
        }
        openHeading.linesLeft -= 1
        if (headingLooksComplete(completed) || openHeading.linesLeft === 0) openHeading = null
        continue
      }

      // DECAL annotates deliberate gaps in their own numbering, e.g. "(no
      // CLL6.3c)". Worth surfacing: it tells us a missing code is intentional
      // rather than something we dropped.
      const gapNote = GAP_NOTE.exec(line.text)
      if (gapNote) {
        warnings.push({
          file: fileLabel,
          page: pageNo,
          message: `DECAL notes a deliberate gap in their numbering: ${gapNote[1]} does not exist`,
        })
        continue
      }

      if (!inColumn) {
        warnings.push({
          file: fileLabel,
          page: pageNo,
          message: `Out-of-column text with no open heading: "${line.text.slice(0, 80)}"`,
        })
        continue
      }

      body.push(line)
    }

    if (anchors.length === 0) return

    // Cell boundaries: the midpoint between adjacent codes. A code is centred in
    // its cell, so these midpoints fall in the gap between table rows.
    const bounds = anchors.map((a, i) => {
      const prev = anchors[i - 1]
      const next = anchors[i + 1]
      // Half the distance to the neighbouring code, mirrored when there is no
      // neighbour, so the first and last cells are the same height as the rest
      // rather than reaching to the page edges.
      const halfAbove = prev ? (a.yCenter - prev.yCenter) / 2 : undefined
      const halfBelow = next ? (next.yCenter - a.yCenter) / 2 : undefined
      const half = halfAbove ?? halfBelow ?? DEFAULT_HALF_CELL
      return {
        top: a.yCenter - (halfAbove ?? half),
        bottom: a.yCenter + (halfBelow ?? half),
      }
    })

    const claimed: string[][] = anchors.map(() => [])
    for (const line of body) {
      const idx = bounds.findIndex((b) => line.yCenter >= b.top && line.yCenter < b.bottom)
      if (idx === -1) {
        warnings.push({
          file: fileLabel,
          page: pageNo,
          message: `Text fell outside every indicator cell and was dropped: "${line.text.slice(0, 80)}"`,
        })
        continue
      }
      claimed[idx]!.push(line.text)
    }

    anchors.forEach((anchor, i) => {
      const parsed = parseFullCode(anchor.fullCode)
      if (!parsed) {
        warnings.push({
          file: fileLabel,
          page: pageNo,
          message: `Code did not parse and was skipped: ${anchor.fullCode}`,
        })
        return
      }

      if (parsed.ageBand !== ageBand) {
        warnings.push({
          file: fileLabel,
          page: pageNo,
          message: `${anchor.fullCode} has age digit ${parsed.ageBand} inside the ${ageBand} band file`,
        })
      }
      if (anchor.domainCode === null) {
        warnings.push({
          file: fileLabel,
          page: pageNo,
          message: `${anchor.fullCode} appeared before any domain header`,
        })
        return
      }
      if (
        parsed.domainCode !== anchor.domainCode ||
        parsed.subdomainCode !== anchor.subdomainCode
      ) {
        warnings.push({
          file: fileLabel,
          page: pageNo,
          message:
            `${anchor.fullCode} sits under header ` +
            `${anchor.domainCode}${anchor.subdomainCode ? `-${anchor.subdomainCode}` : ''} — code and header disagree`,
        })
      }

      const text = normalise([anchor.inlineText, ...claimed[i]!].filter(Boolean).join(' '))
      if (!text) {
        warnings.push({
          file: fileLabel,
          page: pageNo,
          message: `${anchor.fullCode} has no indicator text`,
        })
      }

      // Rebuild the code from its parts rather than trusting the string we read.
      const standardKey =
        parsed.domainCode === 'CD'
          ? `CD-${parsed.subdomainCode}${parsed.standardNumber}`
          : `${parsed.domainCode}${parsed.standardNumber}`

      // DECAL's own headings sometimes drop a letter — "Standard PD1:" for the
      // PDM1 standard, "Standard SE2:" for SED2. Fall back to the truncated
      // spelling rather than losing the standard's wording over their typo.
      const standardText =
        standardTextByNumber.get(standardKey) ??
        (parsed.domainCode === 'PDM' || parsed.domainCode === 'SED'
          ? standardTextByNumber.get(`${parsed.domainCode.slice(0, 2)}${parsed.standardNumber}`)
          : undefined) ??
        null

      indicators.push({
        geldsVersion,
        domainCode: parsed.domainCode,
        subdomainCode: parsed.subdomainCode,
        strandName: anchor.strandName,
        standardNumber: parsed.standardNumber,
        standardText,
        ageBand: parsed.ageBand,
        indicatorLetter: parsed.indicatorLetter,
        fullCode: formatFullCode(parsed),
        indicatorText: text,
        sourceFile: fileLabel,
        sourcePage: pageNo,
      })
    })
  })

  const seenDomains = new Set(indicators.map((i) => i.domainCode))
  for (const d of DOMAIN_CODES) {
    if (!seenDomains.has(d)) {
      warnings.push({ file: fileLabel, page: 0, message: `No ${d} indicators found in this file` })
    }
  }
  const seenSubs = new Set(indicators.map((i) => i.subdomainCode).filter(Boolean))
  for (const s of CD_SUBDOMAIN_CODES) {
    if (!seenSubs.has(s)) {
      warnings.push({
        file: fileLabel,
        page: 0,
        message: `No CD-${s} indicators found in this file`,
      })
    }
  }

  return { indicators, warnings }
}
