#!/usr/bin/env node
/**
 * Release gate. Ticket T-0.7.
 *
 * These markers are fine during development and fatal at a release tag. Each
 * one stands for a decision only Bernard can make; a release with the marker
 * still present means we shipped a placeholder to a paying center.
 *
 * Run automatically in CI when the ref is a tag. Run manually any time:
 *   pnpm lint:release
 */

import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname

const BLOCKERS = [
  {
    marker: 'TODO(pricing)',
    why: 'Every number on the pricing page is a placeholder. PROJECT-INSTRUCTIONS Part 0.2 is still blank.',
  },
  {
    marker: 'TODO(marketing-assets)',
    why: 'The marketing home page still lacks the required real screenshot of the week grid on a phone.',
  },
  {
    marker: 'TODO(demo-form)',
    why: 'The demo page does not actually collect or deliver a request.',
  },
]

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist'])
const EXTENSIONS = /\.(tsx?|jsx?|mjs|css|sql|md)$/

async function* walk(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walk(full)
    } else if (EXTENSIONS.test(entry.name)) {
      yield full
    }
  }
}

const found = new Map()

for await (const file of walk(ROOT)) {
  const rel = relative(ROOT, file)
  // This file names every marker by definition.
  if (rel === join('scripts', 'check-release-blockers.mjs')) continue
  const source = await readFile(file, 'utf8')
  for (const blocker of BLOCKERS) {
    if (source.includes(blocker.marker)) {
      const list = found.get(blocker.marker) ?? []
      list.push(rel)
      found.set(blocker.marker, list)
    }
  }
}

if (found.size === 0) {
  console.log('check-release-blockers: clean')
  process.exit(0)
}

console.error('\nRelease blockers still present:\n')
for (const blocker of BLOCKERS) {
  const files = found.get(blocker.marker)
  if (!files) continue
  console.error(`  ${blocker.marker}`)
  console.error(`    ${blocker.why}`)
  console.error(`    ${[...new Set(files)].join(', ')}\n`)
}

// Only fatal at a release tag. GITHUB_REF is set by CI.
const ref = process.env.GITHUB_REF ?? ''
const isRelease = ref.startsWith('refs/tags/') || process.env.RELEASE === '1'

if (isRelease) {
  console.error('This is a release build. Resolve the blockers above first.\n')
  process.exit(1)
}

console.error('Not a release build — reporting only.\n')
