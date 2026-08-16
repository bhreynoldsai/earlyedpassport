import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Client } from 'pg'
import { asUser, connect, DATABASE_URL, resetSchema, seed, type Fixture } from './harness'

/**
 * Loads the committed GELDS artifact into a real Postgres with the real CHECK
 * constraints.
 *
 * The validator in `supabase/gelds/validate.ts` and the constraints in
 * migration 0003 encode the same rules twice, in two languages. This is the
 * test that proves they agree on the actual data — a code that passes the
 * validator and then fails the insert would abort a load halfway through and
 * leave the table looking populated while missing indicators.
 */

const ARTIFACT = new URL('../../supabase/gelds/gelds-2013-rev-2024.json', import.meta.url).pathname

interface Artifact {
  geldsVersion: string
  total: number
  indicators: {
    domainCode: string
    subdomainCode: string | null
    standardNumber: number
    ageBand: number
    indicatorLetter: string | null
    fullCode: string
    indicatorText: string
  }[]
}

const hasDatabase = DATABASE_URL.length > 0

describe.skipIf(!hasDatabase)('the GELDS artifact loads into the real schema', () => {
  let client: Client
  let fixture: Fixture
  let artifact: Artifact

  beforeAll(async () => {
    artifact = JSON.parse(readFileSync(ARTIFACT, 'utf8')) as Artifact
    client = await connect()
    await resetSchema(client)
    fixture = await seed(client)
  }, 60_000)

  afterAll(async () => {
    await client?.end()
  })

  it('inserts every indicator without tripping a constraint', async () => {
    const rows = artifact.indicators
    const values: unknown[] = []
    const tuples: string[] = []
    rows.forEach((r, i) => {
      const b = i * 7
      tuples.push(`($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7})`)
      values.push(
        artifact.geldsVersion,
        r.domainCode,
        r.subdomainCode,
        r.standardNumber,
        r.ageBand,
        r.fullCode,
        r.indicatorText
      )
    })

    await client.query(
      `insert into gelds_indicator
         (gelds_version, domain_code, subdomain_code, standard_number, age_band, full_code, indicator_text)
       values ${tuples.join(',')}`,
      values
    )

    const { rows: counted } = await client.query<{ count: string }>(
      'select count(*)::text as count from gelds_indicator where gelds_version = $1',
      [artifact.geldsVersion]
    )
    expect(Number(counted[0]?.count)).toBe(artifact.total)
  }, 60_000)

  it('carries all five domains and all five CD subdomains', async () => {
    const { rows: domains } = await client.query<{ domain_code: string }>(
      'select distinct domain_code from gelds_indicator order by domain_code'
    )
    expect(domains.map((r) => r.domain_code).sort()).toEqual(['APL', 'CD', 'CLL', 'PDM', 'SED'])

    const { rows: subs } = await client.query<{ subdomain_code: string }>(
      'select distinct subdomain_code from gelds_indicator where subdomain_code is not null order by subdomain_code'
    )
    expect(subs.map((r) => r.subdomain_code).sort()).toEqual(['CP', 'CR', 'MA', 'SC', 'SS'])
  })

  it('populates every domain × age band cell', async () => {
    const { rows } = await client.query<{ domain_code: string; age_band: number; n: string }>(
      'select domain_code, age_band, count(*)::text as n from gelds_indicator group by 1,2'
    )
    const seen = new Set(rows.map((r) => `${r.domain_code}:${r.age_band}`))
    for (const d of ['PDM', 'SED', 'APL', 'CLL', 'CD']) {
      for (const b of [0, 1, 2, 3, 4]) {
        expect(seen.has(`${d}:${b}`), `${d} at band ${b}`).toBe(true)
      }
    }
  })

  it('builds a search vector for every row', async () => {
    const { rows } = await client.query<{ count: string }>(
      'select count(*)::text as count from gelds_indicator where search_vector is null'
    )
    expect(Number(rows[0]?.count)).toBe(0)
  })

  it('finds indicators by plain English, with no AI involved', async () => {
    // The deterministic fallback the product must work with when every AI
    // feature is switched off.
    const { rows } = await client.query<{ full_code: string }>(
      `select full_code from gelds_indicator
       where search_vector @@ plainto_tsquery('english', $1)
       order by full_code limit 5`,
      ['counting numbers']
    )
    expect(rows.length).toBeGreaterThan(0)
  })

  it('rejects a second row with the same code in the same version', async () => {
    await expect(
      client.query(
        `insert into gelds_indicator
           (gelds_version, domain_code, subdomain_code, standard_number, age_band, full_code, indicator_text)
         values ($1,'CD','MA',1,4,'CD-MA1.4a','duplicate')`,
        [artifact.geldsVersion]
      )
    ).rejects.toThrow(/duplicate key|unique/i)
  })

  it('lets any signed-in teacher read the standards', async () => {
    const { rows, error } = await asUser<{ count: string }>(
      client,
      fixture.teacherA1,
      'select count(*)::text as count from gelds_indicator'
    )
    expect(error).toBeNull()
    expect(Number(rows[0]?.count)).toBe(artifact.total)
  })

  it('still refuses every write, even now that rows exist', async () => {
    const update = await asUser(
      client,
      fixture.directorA,
      `update gelds_indicator set indicator_text = 'tampered'`
    )
    expect(update.rowCount).toBe(0)

    const remove = await asUser(client, fixture.directorA, 'delete from gelds_indicator')
    expect(remove.rowCount).toBe(0)
  })

  it('gives anonymous callers nothing', async () => {
    const { rows, error } = await asUser<{ count: string }>(
      client,
      null,
      'select count(*)::text as count from gelds_indicator'
    )
    if (!error) expect(Number(rows[0]?.count)).toBe(0)
  })
})
