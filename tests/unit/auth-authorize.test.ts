import { describe, expect, it } from 'vitest'
import {
  canEnrollChild,
  canManageStaff,
  roleUsesClassrooms,
  type StaffRole,
} from '../../lib/auth/authorize'

/**
 * This is the one piece of the invite flow the database cannot check for us —
 * inviteStaff() reaches for the service role client to create an auth.users
 * row, which happens entirely outside RLS. If this function is wrong, nothing
 * downstream catches it.
 */
describe('canManageStaff', () => {
  it.each<StaffRole>(['director', 'org_admin'])('lets %s invite staff', (role) => {
    expect(canManageStaff(role)).toBe(true)
  })

  it.each<StaffRole>(['teacher', 'lead_teacher'])('refuses %s', (role) => {
    expect(canManageStaff(role)).toBe(false)
  })

  it('refuses null — no staff row at this center means no permission', () => {
    expect(canManageStaff(null)).toBe(false)
  })

  it('refuses undefined the same way', () => {
    expect(canManageStaff(undefined)).toBe(false)
  })
})

/**
 * The other piece the database can't be trusted to explain on its own —
 * child_insert and enrollment_insert (migration 0004_rls.sql) already
 * enforce this in Postgres, but a denied insert should read as a plain
 * sentence, not a policy-violation error surfaced from Supabase.
 */
describe('canEnrollChild', () => {
  it.each<StaffRole>(['director', 'org_admin'])('lets %s add a child', (role) => {
    expect(canEnrollChild(role)).toBe(true)
  })

  it.each<StaffRole>(['teacher', 'lead_teacher'])('refuses %s', (role) => {
    expect(canEnrollChild(role)).toBe(false)
  })

  it('refuses null', () => {
    expect(canEnrollChild(null)).toBe(false)
  })

  it('refuses undefined', () => {
    expect(canEnrollChild(undefined)).toBe(false)
  })
})

describe('roleUsesClassrooms', () => {
  it.each<StaffRole>(['teacher', 'lead_teacher'])('is true for %s', (role) => {
    expect(roleUsesClassrooms(role)).toBe(true)
  })

  it.each<StaffRole>(['director', 'org_admin'])(
    'is false for %s — migration 0002 says classroom_ids is ignored for director+',
    (role) => {
      expect(roleUsesClassrooms(role)).toBe(false)
    }
  )
})
