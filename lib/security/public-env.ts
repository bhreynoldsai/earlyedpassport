/**
 * Build-time check that no server secret is exposed to the browser.
 * BUILD-INSTRUCTIONS §7.1.
 *
 * `NEXT_PUBLIC_*` variables are inlined into the JavaScript bundle. Anything in
 * one is public, permanently, to anyone who opens devtools. A service role key
 * there bypasses every policy in migration 0004 for every center at once — the
 * single worst thing that can happen to this product.
 *
 * Checking variable NAMES is not enough, and the likely mistake is a paste, not
 * a rename: the two keys sit next to each other in the Supabase dashboard, and
 * both are opaque strings. So we check the VALUES as well, which works because
 * both key formats identify themselves:
 *
 *   sb_secret_...   new-format secret key, self-labelling
 *   eyJ...          legacy JWT, carrying "role":"service_role" in its payload
 *
 * Pure and dependency-free so tests/unit/public-env.test.ts can hold it to
 * account without a build.
 */

/** Names that should never be prefixed NEXT_PUBLIC_, whatever they hold. */
const FORBIDDEN_NAME_FRAGMENTS = ['service_role', 'secret', 'private_key', 'password']

export interface ExposedSecret {
  variable: string
  reason: string
}

/** Decodes a JWT payload without verifying it. We only need the claims. */
function jwtPayload(value: string): Record<string, unknown> | null {
  const parts = value.split('.')
  if (parts.length !== 3) return null
  const payload = parts[1]
  if (!payload) return null
  try {
    const json = Buffer.from(payload, 'base64').toString('utf8')
    const parsed: unknown = JSON.parse(json)
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

/**
 * Every browser-exposed variable that looks like it carries a server secret.
 * Empty array means the build is safe to proceed.
 */
export function findExposedSecrets(env: Record<string, string | undefined>): ExposedSecret[] {
  const found: ExposedSecret[] = []

  for (const [name, value] of Object.entries(env)) {
    if (!name.startsWith('NEXT_PUBLIC_')) continue

    const lowered = name.toLowerCase()
    const badFragment = FORBIDDEN_NAME_FRAGMENTS.find((f) => lowered.includes(f))
    if (badFragment) {
      found.push({ variable: name, reason: `its name contains "${badFragment}"` })
      continue
    }

    if (!value) continue

    if (value.startsWith('sb_secret_')) {
      found.push({ variable: name, reason: 'its value is a Supabase secret key (sb_secret_…)' })
      continue
    }

    const claims = jwtPayload(value)
    if (claims && claims['role'] === 'service_role') {
      found.push({ variable: name, reason: 'its value is a JWT with role=service_role' })
    }
  }

  return found
}

/** Throws with every offender named, rather than failing on the first. */
export function assertNoExposedSecrets(env: Record<string, string | undefined>): void {
  const exposed = findExposedSecrets(env)
  if (exposed.length === 0) return

  const detail = exposed.map((e) => `  - ${e.variable}: ${e.reason}`).join('\n')
  throw new Error(
    `A server secret is exposed through a NEXT_PUBLIC_ variable, which would ship it ` +
      `to every browser:\n\n${detail}\n\n` +
      `Move it to a server-only variable and rotate the key — assume it is already compromised.`
  )
}
