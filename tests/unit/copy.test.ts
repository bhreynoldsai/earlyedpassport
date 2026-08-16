import { describe, expect, it } from 'vitest'
import { copy } from '@/lib/copy'

/**
 * The two strings the spec requires by name, plus the vocabulary rules that a
 * grep in CI can't reason about.
 */

describe('required registry keys', () => {
  it('learning.notAnAssessment says exactly what the spec says', () => {
    expect(copy.learning.notAnAssessment).toBe(
      'These are notes about what teachers have seen. This is not a test or a screening.'
    )
  })

  it('standards.attribution names DECAL', () => {
    expect(copy.standards.attribution).toBe(
      'Standards content © Georgia Department of Early Care and Learning.'
    )
  })

  it('never claims DECAL approval or endorsement', () => {
    const all = JSON.stringify(copy)
    expect(all).not.toMatch(/DECAL[- ]approved/i)
    expect(all).not.toMatch(/endorsed by DECAL/i)
  })
})

describe('banned vocabulary', () => {
  const flatten = (value: unknown, out: string[] = []): string[] => {
    if (typeof value === 'string') out.push(value)
    else if (typeof value === 'object' && value !== null) {
      for (const v of Object.values(value)) flatten(v, out)
    }
    return out
  }

  const strings = flatten(copy)

  it.each(['CRM', 'entity', 'taxonomy', 'metadata', 'invalid', 'submit', 'configure'])(
    'does not use "%s"',
    (word) => {
      const offenders = strings.filter((s) => new RegExp(`\\b${word}\\b`, 'i').test(s))
      expect(offenders).toEqual([])
    }
  )

  it('never uses the bare word "sync"', () => {
    const offenders = strings.filter((s) => /\bsync\b/i.test(s))
    expect(offenders).toEqual([])
  })
})

describe('the save chip never reads as an error', () => {
  it('offers three calm states and no failure state', () => {
    expect(Object.values(copy.save)).not.toContain('Error')
    expect(copy.save.savedOnPhone).toMatch(/back online/i)
  })
})

describe('plain-English domain names', () => {
  it('gives all five domains a name a teacher would say out loud', () => {
    expect(Object.keys(copy.indicators.domainPlain)).toEqual(['PDM', 'SED', 'APL', 'CLL', 'CD'])
    for (const name of Object.values(copy.indicators.domainPlain)) {
      expect(name).not.toMatch(/development|cognitive|approaches/i)
    }
  })

  it('gives all five CD subdomains a plain name', () => {
    expect(Object.keys(copy.indicators.subdomainPlain)).toEqual(['MA', 'SC', 'SS', 'CR', 'CP'])
  })
})

describe('auth copy', () => {
  it('names all four staff_role values', () => {
    expect(Object.keys(copy.auth.roleNames)).toEqual([
      'teacher',
      'lead_teacher',
      'director',
      'org_admin',
    ])
  })

  it('does not say which of email or password was wrong', () => {
    // Naming the field helps someone guessing at an account that exists.
    expect(copy.auth.wrongCredentials).not.toMatch(/\bpassword is wrong\b/i)
    expect(copy.auth.wrongCredentials).not.toMatch(/\bemail (not found|doesn't exist)\b/i)
  })

  it('the invite confirmation always includes the address it went to', () => {
    expect(copy.team.inviteSent('a@example.com')).toContain('a@example.com')
    expect(copy.team.addedToTeam('a@example.com')).toContain('a@example.com')
  })
})
