/**
 * Loads `.env.local` for the standalone scripts.
 *
 * `next dev` and `next build` read `.env.local` for you. `tsx` does not — so
 * the seed script and the GELDS loader, which are plain Node, saw an empty
 * environment and failed with "NEXT_PUBLIC_SUPABASE_URL is not set" even when
 * the file was sitting right there. Importing this module first fixes that.
 *
 * Precedence matches Next.js: a real environment variable beats `.env.local`,
 * which beats `.env`. dotenv does not overwrite an existing value, so loading
 * in that order is enough.
 *
 * Import it for its side effect, before anything reads process.env:
 *
 *     import '../load-env'
 */

import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

// supabase/ -> repo root. These scripts are run via pnpm from the repo root,
// but resolving from this file's own location means they also work when
// invoked from a subdirectory.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const ENV_FILE = join(ROOT, '.env.local')

for (const file of ['.env.local', '.env']) {
  const path = join(ROOT, file)
  if (existsSync(path)) config({ path, quiet: true })
}

/**
 * The message shown when a required variable is missing.
 *
 * It names the file and says to create it, because the mistake this replaces
 * was typing `NAME=value` at a zsh prompt — which sets a shell parameter that
 * is never exported, so the script sees nothing and the old message ("see
 * .env.example") gave no hint that a *file* was the missing piece.
 */
export function missingEnvMessage(name: string): string {
  const lines = [
    `${name} is not set.`,
    '',
    existsSync(ENV_FILE)
      ? `${ENV_FILE} exists but does not define ${name}. Add it there.`
      : `Create a file called .env.local in the repo root (${ROOT}) and put ${name} in it.`,
    '',
    'It has to be a FILE. Typing NAME=value at the shell prompt sets a shell',
    'variable that child processes never see. .env.local is gitignored.',
    '',
    'See docs/SUPABASE-SETUP.md, or copy .env.example as a starting point.',
  ]
  return lines.join('\n')
}
