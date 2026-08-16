/**
 * "Who is signed in, and what can they see?" Ticket T-0.5.
 *
 * Every query here runs through `createServerClient()`, never the service
 * role. That is the point of the exercise: this file proves RLS is enough to
 * answer "what is my center, my role, my rooms" without any app-layer filter
 * doing the actual work. If a query here needed the service role to return
 * the right rows, the policy would be wrong, not this file.
 *
 * Both exports are wrapped in React's `cache()`. `app/(app)/layout.tsx` and
 * `app/(app)/page.tsx` both need the signed-in person's context on the same
 * request; without this they'd be two round trips to Postgres for the same
 * answer instead of one.
 */

import 'server-only'
import { cache } from 'react'
import { createServerClient } from '../supabase/server'
import type { Database } from '../supabase/database.types'

type StaffRole = Database['public']['Enums']['staff_role']

export interface ClassroomSummary {
  id: string
  name: string
  ageBand: number
}

export interface StaffContext {
  userId: string
  email: string
  fullName: string | null
  centerId: string
  centerName: string
  role: StaffRole
  classroomIds: string[]
  classrooms: ClassroomSummary[]
  /**
   * True when this person holds more than one staff row (more than one
   * center). T-0.5 does not build a center switcher — every seeded account
   * has exactly one — but a signed-in person deserves to know if they're
   * seeing only part of the picture rather than silently guessing for them.
   */
  hasOtherCenters: boolean
}

/**
 * Null means "no session, or a session with nowhere to go" — a signed-in
 * `auth.users` row that has no `staff` row anywhere, which happens for a
 * brand-new invite before the director finishes the invite, or for an account
 * that was removed from every center. Callers show a plain explanation rather
 * than a stack trace either way.
 */
export const getStaffContext = cache(async (): Promise<StaffContext | null> => {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // staff_read lets anyone at a center see every staff row there — this
  // query is scoped to the caller's OWN rows only by the `eq`, not by RLS,
  // because RLS's job here is tenant isolation, not "which of my own rows".
  //
  // `.returns<>()` overrides supabase-js's embed inference, which collapses
  // to `never` for a select string it cannot statically parse. The shape
  // below is exactly what the select string above asks for — get one wrong
  // and this is a runtime bug pnpm typecheck cannot see, the tradeoff for
  // not generating a query-aware client.
  const { data: rows, error } = await supabase
    .from('staff')
    .select('center_id, role, classroom_ids, center:center_id (name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .returns<
      {
        center_id: string
        role: StaffRole
        classroom_ids: string[]
        center: { name: string } | null
      }[]
    >()

  if (error) throw new Error(`Could not load staff context: ${error.message}`)
  const primary = rows?.[0]
  if (!primary) return null

  const center = primary.center
  if (!center) throw new Error('Staff row references a center RLS would not let us read.')

  let classrooms: ClassroomSummary[] = []
  if (primary.classroom_ids.length > 0) {
    const { data: rooms, error: roomsError } = await supabase
      .from('classroom')
      .select('id, name, age_band')
      .in('id', primary.classroom_ids)
    if (roomsError) throw new Error(`Could not load rooms: ${roomsError.message}`)
    classrooms = (rooms ?? []).map((r) => ({ id: r.id, name: r.name, ageBand: r.age_band }))
  }

  return {
    userId: user.id,
    email: user.email ?? '',
    fullName: (user.user_metadata as { full_name?: string } | null)?.full_name ?? null,
    centerId: primary.center_id,
    centerName: center.name,
    role: primary.role,
    classroomIds: primary.classroom_ids,
    classrooms,
    hasOtherCenters: (rows?.length ?? 0) > 1,
  }
})

/**
 * Every room at a center — not just the signed-in person's own, which is all
 * `StaffContext.classrooms` carries. The invite form needs the full list so a
 * director (whose own `classroom_ids` is always empty; migration 0002) can
 * assign a new teacher to any room, not none.
 */
export const getCenterClassrooms = cache(async (centerId: string): Promise<ClassroomSummary[]> => {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('classroom')
    .select('id, name, age_band')
    .eq('center_id', centerId)
    .order('name', { ascending: true })
  if (error) throw new Error(`Could not load rooms: ${error.message}`)
  return (data ?? []).map((r) => ({ id: r.id, name: r.name, ageBand: r.age_band }))
})

export interface TeamMember {
  staffId: string
  userId: string
  email: string
  fullName: string | null
  role: StaffRole
  classroomIds: string[]
}

/**
 * Everyone at a center, for the home screen's "your team" list.
 *
 * `staff_read` deliberately has no role check — migration 0004's comment says
 * why: "everyone can see who works at their center." This function does not
 * add one either. Gating who may SEE the roster is the database's call, not
 * this file's; gating who may CHANGE it is `canManageStaff()`.
 */
export const getCenterStaff = cache(async (centerId: string): Promise<TeamMember[]> => {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('staff')
    .select('id, user_id, role, classroom_ids, app_user:user_id (email, full_name)')
    .eq('center_id', centerId)
    .order('role', { ascending: true })
    .returns<
      {
        id: string
        user_id: string
        role: StaffRole
        classroom_ids: string[]
        app_user: { email: string; full_name: string | null } | null
      }[]
    >()

  if (error) throw new Error(`Could not load the team: ${error.message}`)

  return (data ?? []).map((row) => ({
    staffId: row.id,
    userId: row.user_id,
    email: row.app_user?.email ?? '',
    fullName: row.app_user?.full_name ?? null,
    role: row.role,
    classroomIds: row.classroom_ids,
  }))
})
