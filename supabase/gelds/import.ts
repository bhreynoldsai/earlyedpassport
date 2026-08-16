#!/usr/bin/env tsx
/**
 * GELDS import pipeline. Ticket T-0.6.
 *
 *   pnpm gelds:import                     the current edition (live portal)
 *   pnpm gelds:import --edition=2013      the 2013 age-band PDFs
 *   pnpm gelds:import --fetch             download the sources first
 *   pnpm gelds:import --load              also load into Postgres
 *
 * Standalone and re-runnable. The order is fixed and the order is the point:
 * source → parse → VALIDATE → write. Nothing is written and nothing is loaded
 * until every hard gate passes.
 *
 * The 2013 path needs `pdftotext` (poppler-utils). The portal path needs
 * nothing but `curl`.
 */

import '../load-env'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseAgeBandPdf, type ParseWarning, type RawIndicator } from './parse'
import {
  PORTAL_MAIN_URL,
  PORTAL_SEARCH_URL,
  parsePortalIndicators,
  parsePortalStandards,
} from './portal'
import {
  CURRENT_EDITION,
  EDITIONS,
  GELDS_PDF_SOURCES,
  KNOWN_DUPLICATE_NOTE,
  type EditionId,
} from './sources'
import { KNOWN_DUPLICATES, formatReport, validate, type PriorVersionStats } from './validate'

const HERE = dirname(fileURLToPath(import.meta.url))
const SOURCE_DIR = join(HERE, 'source')

const args = process.argv.slice(2)
const flags = new Set(args.filter((a) => !a.startsWith('--edition=')))
const editionArg = args.find((a) => a.startsWith('--edition='))?.split('=')[1]
const editionId = (editionArg ?? CURRENT_EDITION) as EditionId

if (!EDITIONS[editionId]) {
  process.stderr.write(
    `Unknown edition: ${editionId}. Known: ${Object.keys(EDITIONS).join(', ')}\n`
  )
  process.exit(1)
}

const edition = EDITIONS[editionId]
const shouldFetch = flags.has('--fetch')
const shouldLoad = flags.has('--load')
const OUTPUT = join(HERE, `gelds-${editionId}.json`)
const PRIOR_STATS = join(HERE, 'prior-version.json')

function log(msg: string): void {
  process.stdout.write(`${msg}\n`)
}

function download(url: string, target: string): void {
  execFileSync('curl', ['-sS', '-L', '--fail', '--max-time', '120', '-o', target, url], {
    stdio: ['ignore', 'inherit', 'inherit'],
  })
}

function requirePdftotext(): void {
  try {
    execFileSync('pdftotext', ['-v'], { stdio: 'ignore' })
  } catch {
    throw new Error(
      'pdftotext not found. Install poppler-utils (apt-get install poppler-utils / brew install poppler).'
    )
  }
}

function readPriorStats(): PriorVersionStats | undefined {
  if (!existsSync(PRIOR_STATS)) return undefined
  return JSON.parse(readFileSync(PRIOR_STATS, 'utf8')) as PriorVersionStats
}

function parsePdfEdition(): { indicators: RawIndicator[]; warnings: string[] } {
  requirePdftotext()
  const indicators: RawIndicator[] = []
  const warnings: ParseWarning[] = []

  for (const source of GELDS_PDF_SOURCES) {
    const path = join(SOURCE_DIR, source.file)
    if (!existsSync(path)) {
      throw new Error(`Missing source: ${path}\nRun with --fetch, or place the PDF there by hand.`)
    }
    const result = parseAgeBandPdf(path, source.file, source.ageBand, editionId)
    indicators.push(...result.indicators)
    warnings.push(...result.warnings)
    log(
      `  ${source.file.padEnd(24)} band ${source.ageBand}  ${String(result.indicators.length).padStart(4)} indicators`
    )
  }

  return {
    indicators,
    warnings: warnings.map((w) => `${w.file}${w.page ? ` p${w.page}` : ''}: ${w.message}`),
  }
}

function parsePortalEdition(): { indicators: RawIndicator[]; warnings: string[] } {
  const mainPath = join(SOURCE_DIR, 'portal-main.html')
  const searchPath = join(SOURCE_DIR, 'portal-search.html')
  for (const path of [mainPath, searchPath]) {
    if (!existsSync(path)) {
      throw new Error(`Missing source: ${path}\nRun with --fetch.`)
    }
  }

  const standards = parsePortalStandards(readFileSync(mainPath, 'utf8'))
  log(`  standards from the filter form: ${standards.size}`)

  const result = parsePortalIndicators(readFileSync(searchPath, 'utf8'), standards, editionId)
  log(`  indicator cards parsed:         ${result.indicators.length}`)
  if (result.reportedTotal !== null) {
    log(`  portal reports:                 ${result.reportedTotal}`)
  }
  return { indicators: result.indicators, warnings: result.warnings }
}

/**
 * Apply the documented duplicate decisions. Anything not on the allowlist stays
 * a duplicate and the validator fails the run.
 */
function applyKnownDuplicates(indicators: RawIndicator[]): RawIndicator[] {
  const allow = KNOWN_DUPLICATES.filter((d) => d.version === editionId)
  if (allow.length === 0) return indicators

  const out: RawIndicator[] = []
  for (const indicator of indicators) {
    const known = allow.find((d) => d.fullCode === indicator.fullCode)
    if (known && indicator.sourcePage !== known.keepSourceId) {
      log(
        `  dropping ${indicator.fullCode} source id ${indicator.sourcePage} — ${KNOWN_DUPLICATE_NOTE}`
      )
      continue
    }
    out.push(indicator)
  }
  return out
}

async function main(): Promise<void> {
  log(`\n${edition.label}`)
  log(`  ${edition.note}\n`)

  if (shouldFetch) {
    mkdirSync(SOURCE_DIR, { recursive: true })
    log('Downloading sources from DECAL…')
    if (edition.kind === 'pdf') {
      for (const source of GELDS_PDF_SOURCES) {
        log(`  ${source.url}`)
        download(source.url, join(SOURCE_DIR, source.file))
      }
    } else {
      log(`  ${PORTAL_MAIN_URL}`)
      download(PORTAL_MAIN_URL, join(SOURCE_DIR, 'portal-main.html'))
      log(`  ${PORTAL_SEARCH_URL}`)
      download(PORTAL_SEARCH_URL, join(SOURCE_DIR, 'portal-search.html'))
    }
    log('')
  }

  log('Parsing…')
  const parsed = edition.kind === 'pdf' ? parsePdfEdition() : parsePortalEdition()
  const all = applyKnownDuplicates(parsed.indicators)

  if (parsed.warnings.length > 0) {
    log(`\nParser warnings (${parsed.warnings.length}) — not fatal, but read them:`)
    for (const warning of parsed.warnings.slice(0, 40)) log(`  • ${warning}`)
    if (parsed.warnings.length > 40) log(`  … and ${parsed.warnings.length - 40} more`)
  }

  const report = validate(all, readPriorStats())
  log(formatReport(report, editionId))

  if (!report.passed) {
    log('Import aborted. Nothing was written and nothing was loaded.\n')
    process.exitCode = 1
    return
  }

  const sorted = [...all].sort((a, b) => a.fullCode.localeCompare(b.fullCode))
  writeFileSync(
    OUTPUT,
    JSON.stringify(
      {
        geldsVersion: editionId,
        label: edition.label,
        note: edition.note,
        attribution: 'Standards content © Georgia Department of Early Care and Learning.',
        sourceUrls:
          edition.kind === 'pdf'
            ? GELDS_PDF_SOURCES.map((s) => s.url)
            : [PORTAL_MAIN_URL, PORTAL_SEARCH_URL],
        total: sorted.length,
        indicators: sorted,
      },
      null,
      2
    ) + '\n',
    'utf8'
  )
  log(`Wrote ${OUTPUT}`)
  log(`  ${sorted.length} indicators. This file is the artifact — commit it.\n`)

  if (shouldLoad) {
    const { loadIndicators } = await import('./load')
    await loadIndicators(sorted, editionId)
  } else {
    log('Not loading. Re-run with --load once a Supabase project is configured.\n')
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`\n${error instanceof Error ? error.message : String(error)}\n\n`)
  process.exitCode = 1
})
