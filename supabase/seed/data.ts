/**
 * Demo seed data. Ticket T-0.11.
 *
 * NONE OF THIS IS REAL. Every child here is invented, and that is a hard
 * constraint rather than a convenience: `PROJECT-INSTRUCTIONS` §1.2 says no
 * real child data in staging, ever. The names below are fictional, the license
 * number is not a real DECAL number, and every email is at `example.com`, which
 * IANA reserves for documentation and which can never receive mail.
 *
 * Every id starts `5eed…` on purpose. Demo rows are then recognisable at a
 * glance in any query result, and the seed is idempotent — re-running it
 * updates the same rows instead of creating a second demo center.
 *
 * This module is pure. It computes a complete picture of the demo center from a
 * reference date and touches nothing, so tests/unit/seed-data.test.ts can check
 * that every child's age actually falls inside their classroom's age band
 * without standing up a database.
 */

import { AGE_BANDS, type AgeBand } from '../../lib/gelds/constants'

/** Anything under this prefix is demo data and may be deleted at any time. */
export const DEMO_ID_PREFIX = '5eed'

const id = (suffix: string) => `5eed0000-0000-4000-8000-${suffix.padStart(12, '0')}`

export const DEMO_ORG_ID = id('1')
export const DEMO_CENTER_ID = id('2')

/**
 * The password every demo account shares. Fine here because this account can
 * only ever reach invented data — but it is also why a seeded project must
 * never be pointed at a real center. seed.ts refuses to run against anything
 * that looks like production.
 */
export const DEMO_PASSWORD = 'EarlyEd-Demo-2026!'

export interface SeedClassroom {
  id: string
  key: ClassroomKey
  name: string
  ageBand: AgeBand
  capacity: number
  isGaPreK: boolean
}

export type ClassroomKey = 'sunshine' | 'explorers' | 'prek'

export const CLASSROOMS: readonly SeedClassroom[] = [
  {
    id: id('11'),
    key: 'sunshine',
    name: 'Sunshine Room',
    ageBand: 1,
    capacity: 8,
    isGaPreK: false,
  },
  { id: id('12'), key: 'explorers', name: 'Explorers', ageBand: 2, capacity: 10, isGaPreK: false },
  // Georgia Pre-K caps a class at 22, and the flag drives the required
  // components checklist and the differentiation rule on activities.
  { id: id('13'), key: 'prek', name: 'Pre-K Pathways', ageBand: 4, capacity: 22, isGaPreK: true },
]

export interface SeedChild {
  id: string
  firstName: string
  lastName: string
  preferredName: string | null
  /** Written how a teacher would say it aloud, not in a phonetic alphabet. */
  namePronunciation: string | null
  /** Age in months at the reference date. Must sit inside the room's band. */
  ageMonths: number
  homeLanguage: string
  photoConsent: boolean
  classroom: ClassroomKey
  /**
   * Set on the one child who changed rooms recently. Drives a second, closed
   * enrollment row so the demo actually exercises the 14-day handoff grace
   * window in `auth_scoped_child_ids()` — her previous teacher should still
   * see her, and stop seeing her once the window closes.
   */
  promotedFrom?: { classroom: ClassroomKey; daysAgo: number }
}

/**
 * Twelve children. A deliberate mix of home languages, because Georgia centers
 * are not monolingual and a demo that pretends otherwise hides the places where
 * the product needs to handle a name it cannot guess the pronunciation of.
 *
 * photoConsent is false for two of them on purpose. Consent defaults to the
 * safe answer, and the demo should show what a child with no photo looks like
 * rather than implying consent is universal.
 */
export const CHILDREN: readonly SeedChild[] = [
  // -- Sunshine Room, 12–24 months --------------------------------------------
  {
    id: id('101'),
    firstName: 'Amara',
    lastName: 'Boateng',
    preferredName: null,
    namePronunciation: 'ah-MAR-ah',
    ageMonths: 19,
    homeLanguage: 'English',
    photoConsent: true,
    classroom: 'sunshine',
  },
  {
    id: id('102'),
    firstName: 'Luis',
    lastName: 'Herrera',
    preferredName: 'Luisito',
    namePronunciation: null,
    ageMonths: 16,
    homeLanguage: 'Spanish',
    photoConsent: true,
    classroom: 'sunshine',
  },
  {
    id: id('103'),
    firstName: 'Noor',
    lastName: 'Haddad',
    preferredName: null,
    namePronunciation: 'like "nor"',
    ageMonths: 22,
    homeLanguage: 'Arabic',
    photoConsent: false,
    classroom: 'sunshine',
  },

  // -- Explorers, 24–36 months ------------------------------------------------
  {
    id: id('104'),
    firstName: 'Zoe',
    lastName: 'Whitfield',
    preferredName: null,
    namePronunciation: 'ZOH-ee',
    ageMonths: 28,
    homeLanguage: 'English',
    photoConsent: true,
    classroom: 'explorers',
  },
  {
    id: id('105'),
    firstName: 'Dat',
    lastName: 'Nguyen',
    preferredName: null,
    namePronunciation: 'Zaht — rhymes with "shut"',
    ageMonths: 31,
    homeLanguage: 'Vietnamese',
    photoConsent: true,
    classroom: 'explorers',
  },
  {
    id: id('106'),
    firstName: 'Kayla',
    lastName: 'Simmons',
    preferredName: null,
    namePronunciation: null,
    ageMonths: 26,
    homeLanguage: 'English',
    photoConsent: true,
    classroom: 'explorers',
  },
  {
    // Moved up from Sunshine nine days ago. Her old teacher still owes a
    // passport sign-off, so the grace window must keep her visible.
    id: id('107'),
    firstName: 'Mateo',
    lastName: 'Rios',
    preferredName: 'Teo',
    namePronunciation: 'mah-TEH-oh',
    ageMonths: 25,
    homeLanguage: 'Spanish',
    photoConsent: true,
    classroom: 'explorers',
    promotedFrom: { classroom: 'sunshine', daysAgo: 9 },
  },

  // -- Pre-K Pathways, 48–60 months -------------------------------------------
  {
    id: id('108'),
    firstName: 'Jayden',
    lastName: 'Carter',
    preferredName: null,
    namePronunciation: null,
    ageMonths: 52,
    homeLanguage: 'English',
    photoConsent: true,
    classroom: 'prek',
  },
  {
    id: id('109'),
    firstName: 'Fatoumata',
    lastName: 'Diallo',
    preferredName: 'Fatou',
    namePronunciation: 'fah-too-MAH-tah, "Fatou" is fah-TOO',
    ageMonths: 55,
    homeLanguage: 'Fula',
    photoConsent: true,
    classroom: 'prek',
  },
  {
    id: id('110'),
    firstName: 'Emma',
    lastName: 'Lindqvist',
    preferredName: null,
    namePronunciation: 'LIND-kvist',
    ageMonths: 49,
    homeLanguage: 'Swedish',
    photoConsent: false,
    classroom: 'prek',
  },
  {
    id: id('111'),
    firstName: 'Darius',
    lastName: 'Pope',
    preferredName: null,
    namePronunciation: null,
    ageMonths: 58,
    homeLanguage: 'English',
    photoConsent: true,
    classroom: 'prek',
  },
  {
    id: id('112'),
    firstName: 'Priya',
    lastName: 'Raghavan',
    preferredName: null,
    namePronunciation: 'PREE-yah',
    ageMonths: 51,
    homeLanguage: 'Tamil',
    photoConsent: true,
    classroom: 'prek',
  },
]

export type StaffRole = 'teacher' | 'lead_teacher' | 'director' | 'org_admin'

export interface SeedStaff {
  /** The `staff` row id. Fixed, so re-running updates rather than duplicates. */
  id: string
  email: string
  fullName: string
  role: StaffRole
  /** Ignored for director and above, exactly as the schema comment says. */
  classrooms: ClassroomKey[]
}

/**
 * Four staff, one per role we actually ship, so every permission path in
 * migration 0004 has a face to sign in as:
 *
 *   director      sees the whole center
 *   lead_teacher  may edit a child in her rooms (health data lives there)
 *   teacher       may not edit a child, and sees only her own room
 */
export const STAFF: readonly SeedStaff[] = [
  {
    id: id('201'),
    email: 'director@example.com',
    fullName: 'Renee Alvarez',
    role: 'director',
    classrooms: [],
  },
  {
    id: id('202'),
    email: 'lead@example.com',
    fullName: 'Tamika Booker',
    role: 'lead_teacher',
    classrooms: ['prek'],
  },
  {
    id: id('203'),
    email: 'teacher.sunshine@example.com',
    fullName: 'Sofia Nguyen',
    role: 'teacher',
    classrooms: ['sunshine'],
  },
  {
    id: id('204'),
    email: 'teacher.explorers@example.com',
    fullName: 'Marcus Hill',
    role: 'teacher',
    classrooms: ['explorers'],
  },
]

// ---------------------------------------------------------------------------
// Derivation
// ---------------------------------------------------------------------------

/** `YYYY-MM-DD` in UTC. Dates in this product are dates, not instants. */
export function isoDate(d: Date): string {
  const iso = d.toISOString().slice(0, 10)
  return iso
}

export function shiftDays(from: Date, days: number): Date {
  const out = new Date(from)
  out.setUTCDate(out.getUTCDate() + days)
  return out
}

export function shiftMonths(from: Date, months: number): Date {
  const out = new Date(from)
  out.setUTCMonth(out.getUTCMonth() + months)
  return out
}

export interface ResolvedEnrollment {
  /**
   * Fixed, derived from the child's position in CHILDREN. Enrollment has no
   * natural unique key, so without this a second run would give every child a
   * duplicate open enrollment and the "what room is Maya in" view would start
   * picking one arbitrarily.
   */
  id: string
  childId: string
  classroomId: string
  startedOn: string
  endedOn: string | null
  endedReason: 'promoted' | 'withdrawn' | 'transferred' | null
  programStart: string
}

export interface ResolvedChild extends SeedChild {
  dateOfBirth: string
  classroomId: string
}

export interface ResolvedSeed {
  classrooms: readonly SeedClassroom[]
  children: ResolvedChild[]
  enrollments: ResolvedEnrollment[]
  staff: readonly SeedStaff[]
}

function classroomFor(key: ClassroomKey): SeedClassroom {
  const room = CLASSROOMS.find((c) => c.key === key)
  if (!room) throw new Error(`No classroom with key ${key}`)
  return room
}

/**
 * Turns the fixtures above into rows, relative to a reference date.
 *
 * Ages are stored as months rather than birthdates so the demo does not rot:
 * a fixed date of birth would drift out of its classroom's age band as time
 * passed, and a Pre-K room full of seven-year-olds is a confusing first
 * impression of a product whose whole job is age-appropriate planning.
 */
export function buildSeed(today: Date): ResolvedSeed {
  const children = CHILDREN.map((child) => ({
    ...child,
    dateOfBirth: isoDate(shiftMonths(today, -child.ageMonths)),
    classroomId: classroomFor(child.classroom).id,
  }))

  const enrollments: ResolvedEnrollment[] = []
  CHILDREN.forEach((child, index) => {
    const current = classroomFor(child.classroom).id
    // 401.., and 501.. for the prior room of a child who changed rooms.
    const openId = id(String(401 + index))
    const priorId = id(String(501 + index))

    if (child.promotedFrom) {
      const { classroom, daysAgo } = child.promotedFrom
      const movedOn = isoDate(shiftDays(today, -daysAgo))
      const enrolled = isoDate(shiftDays(today, -daysAgo - 240))
      // The closed row: where she was before, ending the day she moved up.
      enrollments.push({
        id: priorId,
        childId: child.id,
        classroomId: classroomFor(classroom).id,
        startedOn: enrolled,
        endedOn: movedOn,
        endedReason: 'promoted',
        programStart: enrolled,
      })
      // The open row: her room now, starting the day the old one ended.
      enrollments.push({
        id: openId,
        childId: child.id,
        classroomId: current,
        startedOn: movedOn,
        endedOn: null,
        endedReason: null,
        // Program start follows the CHILD, not the room. Compliance deadlines
        // run from when she entered the program, and a promotion must not
        // silently restart her clock.
        programStart: enrolled,
      })
      return
    }

    const started = isoDate(shiftDays(today, -180))
    enrollments.push({
      id: openId,
      childId: child.id,
      classroomId: current,
      startedOn: started,
      endedOn: null,
      endedReason: null,
      programStart: started,
    })
  })

  return { classrooms: CLASSROOMS, children, enrollments, staff: STAFF }
}

/** True when a child's age at `today` sits inside their classroom's band. */
export function ageFitsBand(ageMonths: number, band: AgeBand): boolean {
  const spec = AGE_BANDS.find((a) => a.band === band)
  if (!spec) return false
  return ageMonths >= spec.minMonths && ageMonths < spec.maxMonths
}
