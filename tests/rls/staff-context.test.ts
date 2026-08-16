/**
 * `lib/auth/session.ts` reads staff joined with center or app_user —
 * `.select('center_id, role, ..., center:center_id (name)')` and similar —
 * a shape `tests/rls/tenant-isolation.test.ts` never exercises. That syntax
 * is PostgREST's own embed sugar, meaningless to plain Postgres, so this file
 * writes it out as the JOIN it becomes: does a tenant boundary still hold once
 * two RLS-protected tables meet in one query, or does a join quietly widen
 * what a forged id can reach? Run as a real non-superuser role, against the
 * same fixture tenant-isolation.test.ts uses, so the answer is tested rather
 * than assumed.
 *
 * (In this schema, `center_read` and `app_user_read_colleagues` are both
 * scoped by the same `auth_centers()` as `staff_read` — so whenever a staff
 * row here is visible, its joined center and profile are provably visible
 * too. That is what "each with a readable profile" below is checking for.)
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Client } from 'pg'
import { asUser, connect, DATABASE_URL, resetSchema, seed, type Fixture } from './harness'

const hasDatabase = DATABASE_URL.length > 0

describe.skipIf(!hasDatabase)('the staff-context query shapes', () => {
  let client: Client
  let f: Fixture

  beforeAll(async () => {
    client = await connect()
    await resetSchema(client)
    f = await seed(client)
  }, 60_000)

  afterAll(async () => {
    await client?.end()
  })

  // -- getStaffContext(): staff row joined to its center -----------------------

  describe('getStaffContext', () => {
    const QUERY = `
      select s.center_id, s.role, s.classroom_ids, c.name as center_name
      from staff s
      join center c on c.id = s.center_id
      where s.user_id = $1
      order by s.created_at asc
    `

    it("returns exactly the teacher's own row, with her own center's name", async () => {
      const { rows, error } = await asUser(client, f.teacherA1, QUERY, [f.teacherA1])
      expect(error).toBeNull()
      expect(rows).toHaveLength(1)
      expect(rows[0]?.center_id).toBe(f.centerA)
      expect(rows[0]?.role).toBe('teacher')
      expect(rows[0]?.center_name).toBe('Center A')
    })

    it("returns the director's row with an empty room list", async () => {
      const { rows, error } = await asUser(client, f.directorA, QUERY, [f.directorA])
      expect(error).toBeNull()
      expect(rows).toHaveLength(1)
      expect(rows[0]?.role).toBe('director')
      expect(rows[0]?.classroom_ids).toEqual([])
    })

    it("is not what stops teacherA1 from reading teacherA2's row — RLS permits it", async () => {
      // staff_read has no per-user restriction: any colleague at Center A can
      // read any other colleague's staff row, on purpose ("everyone can see
      // who works at their center", migration 0004). So this query, run by
      // teacherA1 but parameterised with teacherA2's id, correctly returns
      // teacherA2's row — RLS is doing exactly what it's supposed to.
      //
      // Which means the actual privacy property — "getStaffContext() only
      // ever returns MY OWN context" — is not an RLS guarantee at all here.
      // It comes entirely from session.ts always passing user.id, the
      // signed-in caller's own id, as this parameter. Get that one call
      // wrong and the database would not catch it.
      const { rows, error } = await asUser(client, f.teacherA1, QUERY, [f.teacherA2])
      expect(error).toBeNull()
      expect(rows).toHaveLength(1)
      expect(rows[0]?.role).toBe('teacher')
    })

    it('returns nothing for someone with no staff row anywhere', async () => {
      const nobody = '00000000-0000-4000-8000-000000000000'
      const { rows, error } = await asUser(client, f.teacherA1, QUERY, [nobody])
      expect(error).toBeNull()
      expect(rows).toHaveLength(0)
    })
  })

  // -- getCenterStaff(): every staff row at a center, joined to app_user -------

  describe('getCenterStaff', () => {
    const QUERY = `
      select s.id, s.user_id, s.role, s.classroom_ids, au.email, au.full_name
      from staff s
      join app_user au on au.id = s.user_id
      where s.center_id = $1
      order by s.role asc
    `

    it('returns every staff member at Center A, each with a readable profile', async () => {
      const { rows, error } = await asUser(client, f.teacherA1, QUERY, [f.centerA])
      expect(error).toBeNull()
      // teacherA1, teacherA2, directorA — the whole Center A fixture. If the
      // join silently dropped anyone whose app_user row RLS denied, this
      // count would come up short instead of failing loudly.
      expect(rows).toHaveLength(3)
      for (const row of rows) {
        expect(row.email, `staff row ${row.id as string} has no readable app_user`).toMatch(
          /@example\.test$/
        )
      }
    })

    it('lets a plain teacher read the list too — staff_read has no role check', async () => {
      // migration 0004: "everyone can see who works at their center."
      const { rows, error } = await asUser(client, f.teacherA2, QUERY, [f.centerA])
      expect(error).toBeNull()
      expect(rows).toHaveLength(3)
    })

    it("returns nothing for Center B's id when asked by a Center A member", async () => {
      // The forged-center_id case: RLS, not the WHERE clause, must be what
      // stops this — the same shape as forgedRead() in harness.ts.
      const { rows, error } = await asUser(client, f.teacherA1, QUERY, [f.centerB])
      expect(error).toBeNull()
      expect(rows).toHaveLength(0)
    })
  })

  // -- getCenterClassrooms(): every room at a center ---------------------------

  describe('getCenterClassrooms', () => {
    const QUERY = `
      select id, name, age_band
      from classroom
      where center_id = $1
      order by name asc
    `

    it("returns both of Center A's rooms", async () => {
      const { rows, error } = await asUser(client, f.directorA, QUERY, [f.centerA])
      expect(error).toBeNull()
      expect(rows.map((r) => r.id).sort()).toEqual([f.roomA1, f.roomA2].sort())
    })

    it("a Center A director gets nothing for Center B's id", async () => {
      const { rows, error } = await asUser(client, f.directorA, QUERY, [f.centerB])
      expect(error).toBeNull()
      expect(rows).toHaveLength(0)
    })
  })
})
