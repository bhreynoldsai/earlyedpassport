#!/usr/bin/env tsx
/**
 * GELDS import pipeline. Ticket T-0.6.
 *
 *   pnpm gelds:import              parse local sources, validate, write JSON
 *   pnpm gelds:import --fetch      download the PDFs from DECAL first
 *   pnpm gelds:import --load       also load into Postgres (needs service role)
 *
 * Standalone and re-runnable. Order is fixed and the order is the point:
 * source → parse → VALIDATE → load. Nothing reaches the database until every
 * hard gate passes.
 *
 * Requires `pdftotext` (poppler-utils) on PATH.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseAgeBandPdf, type ParseWarning, type RawIndicator } from './parse'
import { GELDS_SOURCES, GELDS_VERSION } from './sources'
import { formatReport, validate, type PriorVersionStats } from './validate'

const HERE = dirname(fileURLToPath(import.meta.url))
const SOURCE_DIR = join(HERE, 'source')
const OUTPUT = join(HERE, `gelds-${GELDS_VERSION}.json`)
const PRIOR_STATS = join(HERE, 'prior-version.json')

const args = new Set(process.argv.slice(2))
const shouldFetch = args.has('--fetch')
const shouldLoad = args.has('--load')

function log(msg: string): void {
  process.stdout.write(`${msg}\n`)
}

function fetchSources(): void {
  mkdirSync(SOURCE_DIR, { recursive: true })
  for (const source of GELDS_SOURCES) {
    const target = join(SOURCE_DIR, source.file)
    log(`  fetching ${source.url}`)
    execFileSync('curl', ['-sS', '-L', '--fail', '--max-time', '120', '-o', target, source.url], {
      stdio: ['ignore', 'inherit', 'inherit'],
    })
  }
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

async function main(): Promise<void> {
  requirePdftotext()

  if (shouldFetch) {
    log('\nDownloading source PDFs from DECAL…')
    fetchSources()
  }

  log('\nParsing…')
  const all: RawIndicator[] = []
  const warnings: ParseWarning[] = []

  for (const source of GELDS_SOURCES) {
    const path = join(SOURCE_DIR, source.file)
    if (!existsSync(path)) {
      throw new Error(`Missing source: ${path}\nRun with --fetch, or place the PDF there by hand.`)
    }
    const result = parseAgeBandPdf(path, source.file, source.ageBand, GELDS_VERSION)
    all.push(...result.indicators)
    warnings.push(...result.warnings)
    log(
      `  ${source.file.padEnd(24)} band ${source.ageBand}  ${String(result.indicators.length).padStart(4)} indicators`
    )
  }

  if (warnings.length > 0) {
    log(`\nParser warnings (${warnings.length}) — not fatal, but read them:`)
    for (const w of warnings.slice(0, 40)) {
      log(`  • ${w.file}${w.page ? ` p${w.page}` : ''}: ${w.message}`)
    }
    if (warnings.length > 40) log(`  … and ${warnings.length - 40} more`)
  }

  const report = validate(all, readPriorStats())
  log(formatReport(report, GELDS_VERSION))

  if (!report.passed) {
    log('Import aborted. Nothing was written and nothing was loaded.\n')
    process.exitCode = 1
    return
  }

  // Deterministic ordering so the committed artifact has a stable diff.
  const sorted = [...all].sort((a, b) => a.fullCode.localeCompare(b.fullCode))
  writeFileSync(
    OUTPUT,
    JSON.stringify(
      {
        geldsVersion: GELDS_VERSION,
        attribution: 'Standards content © Georgia Department of Early Care and Learning.',
        sourceUrls: GELDS_SOURCES.map((s) => s.url),
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
    await loadIndicators(sorted, GELDS_VERSION)
  } else {
    log('Not loading. Re-run with --load once a Supabase project is configured.\n')
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`\n${error instanceof Error ? error.message : String(error)}\n\n`)
  process.exitCode = 1
})
