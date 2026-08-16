import { describe, expect, it } from 'vitest'
import { assertNoExposedSecrets, findExposedSecrets } from '../../lib/security/public-env'

/**
 * The guard that stands between a copy-paste slip and handing every center's
 * data to anyone who opens devtools.
 *
 * A service role key in a `NEXT_PUBLIC_` variable defeats every policy in
 * migration 0004 simultaneously, for every tenant, permanently — the bundle is
 * already on people's machines by the time anyone notices. So the tests below
 * lean deliberately towards catching too much rather than too little.
 */

/** A JWT with no signature we care about; only the payload claims are read. */
function jwt(claims: Record<string, unknown>): string {
  const encode = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url')
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(claims)}.signature`
}

describe('the exposed-secret guard', () => {
  it('passes a correctly configured environment', () => {
    expect(
      findExposedSecrets({
        NEXT_PUBLIC_SUPABASE_URL: 'https://abc.supabase.co',
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_Ieu_IElLIWLr',
        SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_realkey',
        DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
      })
    ).toEqual([])
  })

  it('ignores server-only variables entirely, secret or not', () => {
    expect(
      findExposedSecrets({
        SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_x',
        SUPABASE_SECRET_KEY: 'sb_secret_y',
        SOME_PASSWORD: 'hunter2',
      })
    ).toEqual([])
  })

  // -- name-based -------------------------------------------------------------

  it.each([
    'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SERVICE_ROLE',
    'NEXT_PUBLIC_SUPABASE_SECRET_KEY',
    'NEXT_PUBLIC_DB_PASSWORD',
    'NEXT_PUBLIC_PRIVATE_KEY',
  ])('rejects %s on its name alone', (name) => {
    const found = findExposedSecrets({ [name]: 'anything' })
    expect(found).toHaveLength(1)
    expect(found[0]!.variable).toBe(name)
  })

  it('rejects a forbidden name even when the value is empty', () => {
    // An empty value today is a filled one tomorrow, and the name is the tell.
    expect(findExposedSecrets({ NEXT_PUBLIC_SUPABASE_SECRET_KEY: '' })).toHaveLength(1)
  })

  it('is case-insensitive about names', () => {
    expect(findExposedSecrets({ NEXT_PUBLIC_Service_Role_Key: 'x' })).toHaveLength(1)
  })

  // -- value-based: the realistic mistake -------------------------------------

  /**
   * The two keys sit beside each other in the Supabase dashboard and both look
   * like noise. Pasting the wrong one into the right variable name is far more
   * likely than inventing a variable called NEXT_PUBLIC_SERVICE_ROLE_KEY.
   */
  it('catches a secret key pasted into a correctly named public variable', () => {
    const found = findExposedSecrets({
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_Ieu_IElLIWLrZ_EZIz2s2A',
    })
    expect(found).toHaveLength(1)
    expect(found[0]!.reason).toContain('sb_secret_')
  })

  it('catches a legacy service_role JWT by its claims', () => {
    const found = findExposedSecrets({
      NEXT_PUBLIC_SUPABASE_ANON_KEY: jwt({ role: 'service_role', iss: 'supabase' }),
    })
    expect(found).toHaveLength(1)
    expect(found[0]!.reason).toContain('service_role')
  })

  it('allows a legacy anon JWT, which is what belongs there', () => {
    expect(
      findExposedSecrets({
        NEXT_PUBLIC_SUPABASE_ANON_KEY: jwt({ role: 'anon', iss: 'supabase' }),
      })
    ).toEqual([])
  })

  it('does not choke on values that merely look like JWTs', () => {
    expect(() =>
      findExposedSecrets({
        NEXT_PUBLIC_THING: 'not.a.jwt',
        NEXT_PUBLIC_OTHER: 'a.b',
        NEXT_PUBLIC_THIRD: '',
      })
    ).not.toThrow()
  })

  // -- reporting --------------------------------------------------------------

  it('reports every offender rather than stopping at the first', () => {
    const found = findExposedSecrets({
      NEXT_PUBLIC_SERVICE_ROLE_KEY: 'a',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_b',
    })
    expect(found).toHaveLength(2)
  })

  it('throws naming the variable, so the fix is obvious from the build log', () => {
    expect(() =>
      assertNoExposedSecrets({ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_x' })
    ).toThrow(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/)
  })

  it('tells you to rotate the key, because exposure is not undone by a fix', () => {
    expect(() => assertNoExposedSecrets({ NEXT_PUBLIC_SECRET: 'x' })).toThrow(/rotate/i)
  })

  it('does not throw on a clean environment', () => {
    expect(() => assertNoExposedSecrets({ NEXT_PUBLIC_SUPABASE_URL: 'https://x' })).not.toThrow()
  })
})
