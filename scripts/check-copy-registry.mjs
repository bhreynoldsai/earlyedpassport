#!/usr/bin/env node
/**
 * Ticket T-0.9. Two checks:
 *
 *  1. No user-facing string literals in product JSX. All product copy lives in
 *     lib/copy.ts. Long-form marketing prose under app/(marketing) is exempt —
 *     the registry governs the product UI, where strings are reused and will be
 *     translated; a sales paragraph is neither.
 *
 *  2. No banned vocabulary in lib/copy.ts (BUILD-INSTRUCTIONS §7.2).
 */

import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname

/** Say "child", "page", "list", "thing", "save" instead. */
const BANNED = [
  'CRM',
  'entity',
  'attribute',
  'taxonomy',
  'sync',
  'validate',
  'invalid',
  'submit',
  'configure',
  'parameter',
  'metadata',
]
/** "record" is banned only as a noun for the object; "record a note" is fine. */
const BANNED_PHRASES = [/\brecords?\b(?!\s+(a|an|the|this|that|it|what|your))/i]

const SCAN_DIRS = ['components', join('app', '(app)'), join('app', '(auth)')]

async function* walk(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
      yield* walk(full)
    } else if (/\.tsx$/.test(entry.name)) {
      yield full
    }
  }
}

const failures = []

// --- 1. String literals in product JSX -------------------------------------

/** Attributes whose string value is read aloud or shown to a person. */
const HUMAN_ATTRS = /\b(aria-label|alt|title|placeholder|aria-description)\s*=\s*"([^"]{2,})"/g

for (const dir of SCAN_DIRS) {
  for await (const file of walk(join(ROOT, dir))) {
    const rel = relative(ROOT, file)
    const source = await readFile(file, 'utf8')

    source.split('\n').forEach((line, index) => {
      const lineNo = index + 1

      for (const match of line.matchAll(HUMAN_ATTRS)) {
        failures.push(`${rel}:${lineNo}  ${match[1]}="${match[2]}" — move it to lib/copy.ts`)
      }

      // JSX text nodes: content between > and < that is not an expression.
      for (const match of line.matchAll(/>([^<>{}]+)</g)) {
        const text = match[1].trim()
        // Two or more words of actual prose. Single symbols (✓, ×, —) are not copy.
        if (/[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(text)) {
          failures.push(`${rel}:${lineNo}  "${text}" — move it to lib/copy.ts`)
        }
      }
    })
  }
}

// --- 2. Banned vocabulary in the registry ----------------------------------

const copySource = await readFile(join(ROOT, 'lib', 'copy.ts'), 'utf8')

copySource.split('\n').forEach((line, index) => {
  // Only inspect string values, not identifiers or comments. Comments are
  // where we explain the rules, so they legitimately name the banned words.
  const trimmed = line.trim()
  if (trimmed.startsWith('*') || trimmed.startsWith('//') || trimmed.startsWith('/*')) return
  const strings = line.match(/'([^']*)'|"([^"]*)"|`([^`]*)`/g) ?? []
  for (const raw of strings) {
    const text = raw.slice(1, -1)
    for (const word of BANNED) {
      if (new RegExp(`\\b${word}\\b`, 'i').test(text)) {
        failures.push(`lib/copy.ts:${index + 1}  banned word "${word}" in ${raw}`)
      }
    }
    for (const pattern of BANNED_PHRASES) {
      if (pattern.test(text)) {
        failures.push(`lib/copy.ts:${index + 1}  banned noun "record" in ${raw}`)
      }
    }
  }
})

// --- 3. The two strings the spec requires by name --------------------------

for (const key of ['notAnAssessment', 'attribution']) {
  if (!copySource.includes(`${key}:`)) {
    failures.push(`lib/copy.ts  missing required registry key: ${key}`)
  }
}

if (failures.length > 0) {
  console.error('\nCopy rules violated.\n')
  for (const failure of failures) console.error('  ' + failure)
  console.error('')
  process.exit(1)
}

console.log('check-copy-registry: clean')
