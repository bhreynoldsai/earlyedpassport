#!/usr/bin/env node
/**
 * Fails the build on a hardcoded hex colour anywhere outside the token sheet.
 *
 * DESIGN-BRIEF §2: "Ship as CSS custom properties on :root, mapped into the
 * Tailwind theme. No hardcoded hex anywhere in a component."
 *
 * The only file allowed to contain hex values is app/globals.css, which is the
 * token sheet itself.
 */

import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const SCAN_DIRS = ['app', 'components', 'lib']
const ALLOWED = new Set([
  // The token sheet itself.
  'app/globals.css',
  // The PWA manifest. The browser reads background_color and theme_color
  // before any stylesheet exists, so they cannot be custom properties. They are
  // pinned to the token sheet by tests/unit/manifest-colors.test.ts, which
  // fails if the two ever drift.
  'app/manifest.ts',
])
const EXTENSIONS = /\.(tsx?|jsx?|css)$/
const HEX = /#[0-9a-fA-F]{3,8}\b/g

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
    } else if (EXTENSIONS.test(entry.name)) {
      yield full
    }
  }
}

const failures = []

for (const dir of SCAN_DIRS) {
  for await (const file of walk(join(ROOT, dir))) {
    const rel = relative(ROOT, file)
    if (ALLOWED.has(rel)) continue

    const source = await readFile(file, 'utf8')
    source.split('\n').forEach((line, index) => {
      // A hex inside a comment is documentation, not a shipped value.
      const stripped = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '')
      const matches = stripped.match(HEX)
      if (matches) {
        failures.push(`${rel}:${index + 1}  ${matches.join(', ')}  →  ${line.trim()}`)
      }
    })
  }
}

if (failures.length > 0) {
  console.error('\nHardcoded hex colours found. Use a design token instead.\n')
  for (const failure of failures) console.error('  ' + failure)
  console.error(
    '\nTokens live in app/globals.css (DESIGN-BRIEF §2). Add one there and reference it.\n'
  )
  process.exit(1)
}

console.log('check-no-hardcoded-hex: clean')
