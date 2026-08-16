import { describe, expect, it } from 'vitest'
import { AGE_BANDS } from '../../lib/gelds/constants'
import {
  ageFitsBand,
  buildSeed,
  CHILDREN,
  CLASSROOMS,
  DEMO_CENTER_ID,
  DEMO_ID_PREFIX,
  DEMO_ORG_ID,
  STAFF,
} from '../../supabase/seed/data'

/**
 * The demo center is the first thing anyone sees, so its internal consistency
 * is worth a test rather than an eyeball.
 *
 * The invariant that actually matters is the age one. A Pre-K room holding a
 * two-year-old, or a toddler room holding a five-year-old, would make every
 * age-banded GELDS suggestion in the planner look broken — and the planner is
 * the product. Ages are stored as months precisely so they cannot rot, and this
 * is the test that proves the arithmetic on top of them holds.
 */

// A date with no month-end trickiness, so the derivations are easy to reason
// about. The rotation tests below use awkward dates on purpose.
const REFERENCE = new Date('2026-08-16T00:00:00Z')

describe('the demo center is internally consistent', () => {
  const seed = buildSeed(REFERENCE)

  it('matches the ticket: 1 center, 3 classrooms, 12 children', () => {
    expect(CLASSROOMS).toHaveLength(3)
    expect(CHILDREN).toHaveLength(12)
    expect(STAFF).toHaveLength(4)
  })

  it('puts every child in a room whose age band actually fits them', () => {
    for (const child of CHILDREN) {
      const room = CLASSROOMS.find((c) => c.key === child.classroom)
      expect(room, `${child.firstName} is in unknown room ${child.classroom}`).toBeDefined()
      expect(
        ageFitsBand(child.ageMonths, room!.ageBand),
        `${child.firstName} is ${child.ageMonths}mo, which is outside ${room!.name} (${
          AGE_BANDS.find((a) => a.band === room!.ageBand)?.label
        })`
      ).toBe(true)
    }
  })

  it('derives a date of birth that reproduces the stated age', () => {
    for (const child of seed.children) {
      const dob = new Date(`${child.dateOfBirth}T00:00:00Z`)
      const months =
        (REFERENCE.getUTCFullYear() - dob.getUTCFullYear()) * 12 +
        (REFERENCE.getUTCMonth() - dob.getUTCMonth())
      // Exact, because both sides are computed in whole UTC months.
      expect(months, `${child.firstName}`).toBe(child.ageMonths)
      expect(dob.getTime()).toBeLessThan(REFERENCE.getTime())
    }
  })

  it('gives every child exactly one open enrollment', () => {
    for (const child of CHILDREN) {
      const open = seed.enrollments.filter((e) => e.childId === child.id && e.endedOn === null)
      expect(open, `${child.firstName} has ${open.length} current rooms`).toHaveLength(1)
    }
  })

  it("puts each child's open enrollment in the room they belong to", () => {
    for (const child of seed.children) {
      const open = seed.enrollments.find((e) => e.childId === child.id && e.endedOn === null)
      expect(open?.classroomId).toBe(child.classroomId)
    }
  })

  // -- the handoff window ----------------------------------------------------

  describe('the child who changed rooms', () => {
    const moved = CHILDREN.filter((c) => c.promotedFrom)

    it('exists, or the demo never exercises the grace window', () => {
      expect(moved).toHaveLength(1)
    })

    it('left recently enough that the previous teacher still has access', () => {
      // auth_scoped_child_ids() uses 14 days. Sitting at 13 or 15 would make the
      // demo depend on which side of a boundary it landed.
      expect(moved[0]!.promotedFrom!.daysAgo).toBeLessThan(14)
      expect(moved[0]!.promotedFrom!.daysAgo).toBeGreaterThan(2)
    })

    it('has a closed row and an open row that meet on the same day', () => {
      const rows = seed.enrollments.filter((e) => e.childId === moved[0]!.id)
      expect(rows).toHaveLength(2)

      const closed = rows.find((r) => r.endedOn !== null)
      const open = rows.find((r) => r.endedOn === null)
      expect(closed?.endedReason).toBe('promoted')
      expect(open?.startedOn).toBe(closed?.endedOn)
    })

    it('does not restart the compliance clock on promotion', () => {
      // program_start follows the child. If a promotion reset it, every deadline
      // in lib/compliance/rules.ts would silently move.
      const rows = seed.enrollments.filter((e) => e.childId === moved[0]!.id)
      expect(new Set(rows.map((r) => r.programStart)).size).toBe(1)
    })
  })

  // -- ids and safety --------------------------------------------------------

  it('marks every row as demo data with a 5eed id', () => {
    const ids = [
      DEMO_ORG_ID,
      DEMO_CENTER_ID,
      ...CLASSROOMS.map((c) => c.id),
      ...CHILDREN.map((c) => c.id),
      ...STAFF.map((s) => s.id),
      ...seed.enrollments.map((e) => e.id),
    ]
    for (const value of ids) expect(value.startsWith(DEMO_ID_PREFIX)).toBe(true)
  })

  it('never reuses an id', () => {
    const ids = [
      DEMO_ORG_ID,
      DEMO_CENTER_ID,
      ...CLASSROOMS.map((c) => c.id),
      ...CHILDREN.map((c) => c.id),
      ...STAFF.map((s) => s.id),
      ...seed.enrollments.map((e) => e.id),
    ]
    expect(new Set(ids).size).toBe(ids.length)
  })

  /**
   * example.com is reserved by IANA and cannot receive mail. A demo account at
   * a domain that *can* would eventually send a password reset to a stranger.
   */
  it('uses only addresses that can never receive mail', () => {
    for (const person of STAFF) {
      expect(person.email.endsWith('@example.com'), person.email).toBe(true)
    }
  })

  it('covers the three roles whose permissions differ', () => {
    expect(new Set(STAFF.map((s) => s.role))).toEqual(
      new Set(['director', 'lead_teacher', 'teacher'])
    )
  })

  it('assigns rooms to classroom-scoped staff and none to the director', () => {
    for (const person of STAFF) {
      if (person.role === 'director' || person.role === 'org_admin') {
        expect(person.classrooms, `${person.fullName} is director+`).toHaveLength(0)
      } else {
        expect(person.classrooms.length, `${person.fullName} has no room`).toBeGreaterThan(0)
      }
    }
  })

  it('marks exactly one room as Georgia Pre-K, capped at 22', () => {
    const prek = CLASSROOMS.filter((c) => c.isGaPreK)
    expect(prek).toHaveLength(1)
    expect(prek[0]!.capacity).toBeLessThanOrEqual(22)
    expect(prek[0]!.ageBand).toBe(4)
  })

  it('keeps every room inside its capacity', () => {
    for (const room of CLASSROOMS) {
      const enrolled = CHILDREN.filter((c) => c.classroom === room.key).length
      expect(enrolled, `${room.name} is over capacity`).toBeLessThanOrEqual(room.capacity)
    }
  })

  it('leaves photo consent off for some children, since it defaults off', () => {
    const withheld = CHILDREN.filter((c) => !c.photoConsent)
    expect(withheld.length).toBeGreaterThan(0)
  })

  // -- rotation --------------------------------------------------------------

  /**
   * The seed is dated relative to whenever it runs. These awkward reference
   * dates are the ones where naive month arithmetic goes wrong — a 31st, a leap
   * day, and a year boundary.
   */
  it.each(['2027-03-31', '2028-02-29', '2026-12-31', '2027-01-01'])(
    'still places every child correctly when run on %s',
    (day) => {
      const later = buildSeed(new Date(`${day}T00:00:00Z`))
      expect(later.children).toHaveLength(12)

      for (const child of later.children) {
        const room = CLASSROOMS.find((c) => c.id === child.classroomId)!
        const dob = new Date(`${child.dateOfBirth}T00:00:00Z`)
        expect(Number.isNaN(dob.getTime()), `${child.firstName} has an invalid DOB`).toBe(false)
        expect(ageFitsBand(child.ageMonths, room.ageBand)).toBe(true)
      }

      for (const e of later.enrollments) {
        if (e.endedOn) expect(e.endedOn >= e.startedOn).toBe(true)
        expect(e.programStart <= e.startedOn).toBe(true)
      }
    }
  )
})
