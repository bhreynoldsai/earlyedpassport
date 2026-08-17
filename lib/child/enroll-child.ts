/**
 * Adding a child. Ticket: child/passport MVP.
 *
 * Unlike lib/auth/invite-staff.ts, this never touches the service role.
 * `child_insert` and `enrollment_insert` (migration 0004_rls.sql) already
 * permit a director/org_admin to write both rows through their own client —
 * there is no auth.users identity to create here, so RLS is the whole
 * check. `canEnrollChild()` still runs first anyway, for the same reason
 * every write path in this app checks in code before it checks in SQL: a
 * denied insert should read as "you can't do that," not a raw Postgres
 * policy-violation error.
 */

import 'server-only'
import { createServerClient } from '../supabase/server'
import { canEnrollChild } from '../auth/authorize'
import { getStaffContext } from '../auth/session'
import { todayUtc } from '../week'
import type { EnrollChildInput } from './schemas'

export interface EnrollChildResult {
  childId: string
}

export async function enrollChild(input: EnrollChildInput): Promise<EnrollChildResult> {
  const context = await getStaffContext()
  if (!context) throw new Error('You need a room at a center before you can add a child.')
  if (!canEnrollChild(context.role)) throw new Error('Only a director can add a child.')

  const supabase = await createServerClient()

  const child = await supabase
    .from('child')
    .insert({
      center_id: context.centerId,
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      preferred_name: input.preferredName?.trim() || null,
      name_pronunciation: input.namePronunciation?.trim() || null,
      date_of_birth: input.dateOfBirth,
      home_language: input.homeLanguage?.trim() || null,
      created_by: context.userId,
    })
    .select('id')
    .single()
  if (child.error) throw new Error(`Could not save this child: ${child.error.message}`)

  const today = todayUtc()
  const enrollment = await supabase.from('enrollment').insert({
    center_id: context.centerId,
    child_id: child.data.id,
    classroom_id: input.classroomId,
    started_on: today,
    program_start: today,
    created_by: context.userId,
  })
  if (enrollment.error) {
    throw new Error(
      `Saved the child but could not enroll her in a room: ${enrollment.error.message}`
    )
  }

  return { childId: child.data.id }
}
