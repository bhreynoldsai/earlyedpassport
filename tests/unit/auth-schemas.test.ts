import { describe, expect, it } from 'vitest'
import {
  inviteStaffSchema,
  requestResetSchema,
  setPasswordSchema,
  signInSchema,
} from '../../lib/auth/schemas'

/**
 * Every message here is asserted, not just "did it fail" — the whole point of
 * writing these by hand was to avoid Zod's default wording, which uses words
 * BUILD-INSTRUCTIONS §7.2 bans everywhere else a person reads them ("Invalid
 * email"). A test that only checks .success would let that regress silently.
 */

describe('signInSchema', () => {
  it('accepts a normal email and any non-empty password', () => {
    const result = signInSchema.safeParse({ email: 'a@example.com', password: 'x' })
    expect(result.success).toBe(true)
  })

  it('rejects a missing email with plain wording', () => {
    const result = signInSchema.safeParse({ email: '', password: 'x' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Add an email address.')
    }
  })

  it('rejects a malformed email without the word "invalid"', () => {
    const result = signInSchema.safeParse({ email: 'not-an-email', password: 'x' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message.toLowerCase()).not.toContain('invalid')
    }
  })

  it('rejects an empty password', () => {
    const result = signInSchema.safeParse({ email: 'a@example.com', password: '' })
    expect(result.success).toBe(false)
  })
})

describe('requestResetSchema', () => {
  it('is just an email', () => {
    expect(requestResetSchema.safeParse({ email: 'a@example.com' }).success).toBe(true)
    expect(requestResetSchema.safeParse({ email: 'nope' }).success).toBe(false)
  })
})

describe('setPasswordSchema', () => {
  it('accepts two matching passwords of at least 8 characters', () => {
    const result = setPasswordSchema.safeParse({
      password: 'longenough',
      confirmPassword: 'longenough',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a password under 8 characters', () => {
    const result = setPasswordSchema.safeParse({ password: 'short1', confirmPassword: 'short1' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Use at least 8 characters.')
    }
  })

  it('rejects a mismatch and blames the second field', () => {
    const result = setPasswordSchema.safeParse({
      password: 'longenough',
      confirmPassword: 'somethingelse',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword'])
      expect(result.error.issues[0]?.message).toBe('Those two don’t match.')
    }
  })
})

describe('inviteStaffSchema', () => {
  it('accepts a teacher with rooms', () => {
    const result = inviteStaffSchema.safeParse({
      email: 'teacher@example.com',
      fullName: 'Sofia Nguyen',
      role: 'teacher',
      classroomIds: ['5eed0000-0000-4000-8000-000000000011'],
    })
    expect(result.success).toBe(true)
  })

  it('defaults classroomIds to empty — a director invite never sends any', () => {
    const result = inviteStaffSchema.safeParse({
      email: 'director@example.com',
      fullName: 'Renee Alvarez',
      role: 'director',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.classroomIds).toEqual([])
  })

  it('rejects a role outside the four the database allows', () => {
    const result = inviteStaffSchema.safeParse({
      email: 'a@example.com',
      fullName: 'A',
      role: 'super_admin',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a classroom id that is not a uuid', () => {
    const result = inviteStaffSchema.safeParse({
      email: 'a@example.com',
      fullName: 'A',
      role: 'teacher',
      classroomIds: ['not-a-uuid'],
    })
    expect(result.success).toBe(false)
  })

  it('rejects a blank name', () => {
    const result = inviteStaffSchema.safeParse({
      email: 'a@example.com',
      fullName: '',
      role: 'teacher',
    })
    expect(result.success).toBe(false)
  })
})
