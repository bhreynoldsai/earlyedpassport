/**
 * Pure authorization rules. Ticket T-0.5.
 *
 * Extracted from the invite server action on purpose. That action reaches for
 * `createServiceRoleClient()` to create an `auth.users` row and an `app_user`
 * profile for someone else — two things no RLS policy can cover, because RLS
 * governs rows in `public`, not identities in `auth`. The moment service role
 * is involved, the database stops being the thing that stops a mistake, which
 * is exactly the situation `lib/supabase/server.ts` warns about.
 *
 * So the check has to happen here, in code, before service role is ever
 * touched — and it has to be a function simple enough to trust by reading it,
 * with a unit test that cannot be skipped the way an integration test against
 * a live database can be.
 */

import type { Database } from '../supabase/database.types'

export type StaffRole = Database['public']['Enums']['staff_role']

/** Director and org_admin manage staff. Teacher and lead_teacher do not. */
const STAFF_MANAGER_ROLES: readonly StaffRole[] = ['director', 'org_admin']

export function canManageStaff(role: StaffRole | null | undefined): boolean {
  if (!role) return false
  return STAFF_MANAGER_ROLES.includes(role)
}

/**
 * Room assignments are meaningful only for the two classroom-scoped roles.
 * Mirrors the comment on `staff.classroom_ids` in migration 0002: "Ignored
 * for director+." Enforcing that here means an invite form cannot silently
 * assign rooms to a director that the database would just ignore anyway.
 */
export function roleUsesClassrooms(role: StaffRole): boolean {
  return role === 'teacher' || role === 'lead_teacher'
}
