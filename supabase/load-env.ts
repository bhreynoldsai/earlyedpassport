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

for (const file of ['.env.local', '.env']) {
  const path = join(ROOT, file)
  if (existsSync(path)) config({ path, quiet: true })
}
