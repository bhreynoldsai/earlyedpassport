/**
 * Reading children. Ticket: child/passport MVP.
 *
 * Same discipline as lib/auth/session.ts: every query runs through the
 * caller's own RLS-scoped client. `child_read` already answers "which
 * children can this person see" (director sees the whole center; a
 * teacher/lead_teacher sees only children currently — or within the last
 * 14 days — in one of her own rooms), so these functions add nothing on
 * top of that beyond the `center_id` scope every table carries.
 */

import 'server-only'
import { cache } from 'react'
import { createServerClient } from '../supabase/server'

export interface ChildSummary {
  id: string
  firstName: string
  lastName: string
  preferredName: string | null
  dateOfBirth: string
  classroomName: string | null
}

/**
 * Two queries, not an embedded select: `child_current_classroom` is a VIEW
 * (migration 0002_core_schema.sql), and PostgREST's `col:fk(...)` embed
 * shorthand needs a real foreign-key constraint to resolve the join — a view
 * carries no constraints, so `classroom:classroom_id (name)` here would
 * either fail outright or silently return null depending on how the
 * introspection cache sees it. A plain second lookup has no such risk.
 */
async function currentClassroomNames(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  centerId: string
): Promise<Map<string, string>> {
  const { data: rawLinks, error: linksError } = await supabase
    .from('child_current_classroom')
    .select('child_id, classroom_id')
    .eq('center_id', centerId)
  if (linksError) throw new Error(`Could not load current rooms: ${linksError.message}`)

  // The view's generated Row type carries every column as nullable — Postgres
  // views don't preserve the NOT NULL constraints of the tables behind them —
  // even though child_current_classroom's own definition (migration
  // 0002_core_schema.sql) can never actually produce a null child_id or
  // classroom_id. Narrowing here, once, is cheaper than threading `| null`
  // through every caller below for a case that can't happen.
  const links = (rawLinks ?? []).filter(
    (link): link is { child_id: string; classroom_id: string } =>
      link.child_id !== null && link.classroom_id !== null
  )
  if (links.length === 0) return new Map()

  const classroomIds = [...new Set(links.map((link) => link.classroom_id))]
  const { data: rooms, error: roomsError } = await supabase
    .from('classroom')
    .select('id, name')
    .in('id', classroomIds)
  if (roomsError) throw new Error(`Could not load room names: ${roomsError.message}`)

  const roomNameById = new Map((rooms ?? []).map((room) => [room.id, room.name]))
  const names = new Map<string, string>()
  for (const link of links) {
    const name = roomNameById.get(link.classroom_id)
    if (name) names.set(link.child_id, name)
  }
  return names
}

/** Every child the signed-in person can see at this center — RLS decides who that is. */
export const getCenterChildren = cache(async (centerId: string): Promise<ChildSummary[]> => {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('child')
    .select('id, first_name, last_name, preferred_name, date_of_birth')
    .eq('center_id', centerId)
    .order('first_name', { ascending: true })
  if (error) throw new Error(`Could not load children: ${error.message}`)

  const classroomNames = await currentClassroomNames(supabase, centerId)

  return (data ?? []).map((row) => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    preferredName: row.preferred_name,
    dateOfBirth: row.date_of_birth,
    classroomName: classroomNames.get(row.id) ?? null,
  }))
})

export interface ChildDetail extends ChildSummary {
  namePronunciation: string | null
  homeLanguage: string | null
  photoConsent: boolean
}

/** Null means either the id doesn't exist or `child_read` doesn't let this caller see it — same as getStaffContext, no distinction is made between the two. */
export const getChild = cache(
  async (centerId: string, childId: string): Promise<ChildDetail | null> => {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('child')
      .select(
        'id, first_name, last_name, preferred_name, name_pronunciation, date_of_birth, home_language, photo_consent'
      )
      .eq('center_id', centerId)
      .eq('id', childId)
      .maybeSingle()
    if (error) throw new Error(`Could not load this child: ${error.message}`)
    if (!data) return null

    const classroomNames = await currentClassroomNames(supabase, centerId)

    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      preferredName: data.preferred_name,
      namePronunciation: data.name_pronunciation,
      dateOfBirth: data.date_of_birth,
      homeLanguage: data.home_language,
      photoConsent: data.photo_consent,
      classroomName: classroomNames.get(data.id) ?? null,
    }
  }
)
