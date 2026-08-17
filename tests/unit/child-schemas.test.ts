import { describe, expect, it } from 'vitest'
import { enrollChildSchema } from '../../lib/child/schemas'

describe('enrollChildSchema', () => {
  const valid = {
    firstName: 'Amara',
    lastName: 'Okafor',
    dateOfBirth: '2022-03-01',
    classroomId: '5eed0000-0000-4000-8000-000000000011',
  }

  it('accepts the minimum required fields', () => {
    expect(enrollChildSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts the optional fields too', () => {
    const result = enrollChildSchema.safeParse({
      ...valid,
      preferredName: 'Mari',
      namePronunciation: 'uh-MAR-uh',
      homeLanguage: 'Yoruba',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a missing first name', () => {
    const result = enrollChildSchema.safeParse({ ...valid, firstName: '' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.message).toBe('Add a first name.')
  })

  it('rejects a missing last name', () => {
    const result = enrollChildSchema.safeParse({ ...valid, lastName: '' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.message).toBe('Add a last name.')
  })

  it('rejects a date of birth in the future', () => {
    const nextYear = new Date()
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    const result = enrollChildSchema.safeParse({
      ...valid,
      dateOfBirth: nextYear.toISOString().slice(0, 10),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message.toLowerCase()).not.toContain('invalid')
    }
  })

  it('rejects a classroom id that is not a uuid', () => {
    const result = enrollChildSchema.safeParse({ ...valid, classroomId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('rejects a missing classroom', () => {
    const result = enrollChildSchema.safeParse({ ...valid, classroomId: '' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.message).toBe('Pick a room.')
  })
})
