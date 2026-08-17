/**
 * Enrolling a child. Ticket: child/passport MVP.
 *
 * Only the fields migration 0002_core_schema.sql's `child` table actually
 * carries — first/last/preferred name, pronunciation, date of birth, home
 * language, and a starting classroom. Allergies, pickup people, and
 * handoff notes are real, planned parts of the passport (see lib/copy.ts's
 * `child` and `passport` sections) but have no table yet — asking for them
 * here would collect data this schema has nowhere to put.
 */

import { z } from 'zod'
import { todayUtc } from '../week'

export const enrollChildSchema = z.object({
  firstName: z.string().min(1, 'Add a first name.'),
  lastName: z.string().min(1, 'Add a last name.'),
  preferredName: z.string().optional(),
  namePronunciation: z.string().optional(),
  dateOfBirth: z
    .string()
    .min(1, 'Add a date of birth.')
    .refine((value) => value <= todayUtc(), 'That date hasn’t happened yet.'),
  homeLanguage: z.string().optional(),
  classroomId: z.string().uuid('Pick a room.'),
})
export type EnrollChildInput = z.infer<typeof enrollChildSchema>
