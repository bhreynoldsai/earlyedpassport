/**
 * Inviting a teacher. Ticket T-0.5.
 *
 * THIS IS ONE OF THE FEW PLACES IN THE APP THAT TOUCHES THE SERVICE ROLE.
 * Creating an `auth.users` row and a profile for someone else is not
 * something any RLS policy can permit — `app_user` has no insert policy for
 * `authenticated` at all, on purpose, because a plain signed-in user must
 * never be able to create an identity record impersonating somebody else's
 * email address.
 *
 * That means the database cannot catch a mistake here. `canManageStaff()` is
 * checked, by hand, against a row read through the CALLER's own RLS-scoped
 * client, before the service role is touched at all. The one write that
 * *does* have a policy — the `staff` row itself — goes through the caller's
 * own client anyway, RLS-checked like everything else, rather than riding
 * along on the service role just because it's already in scope.
 */

import 'server-only'
import { headers } from 'next/headers'
import { createServerClient, createServiceRoleClient } from '../supabase/server'
import { canManageStaff, roleUsesClassrooms, type StaffRole } from './authorize'
import type { InviteStaffInput } from './schemas'
import { getStaffContext } from './session'

export interface InviteStaffResult {
  /** 'invited' sent an email. 'addedExisting' did not — see the note below. */
  outcome: 'invited' | 'addedExisting'
  email: string
}

/**
 * The deployed origin, from the request itself rather than a hardcoded env
 * var. A hardcoded `NEXT_PUBLIC_SITE_URL` would send every preview deploy's
 * invite emails back to production. `x-forwarded-*` is what Vercel's proxy
 * sets, and is trustworthy here specifically because this only ever runs
 * server-side, behind that proxy — never derived from a value a browser sent.
 */
async function requireOrigin(): Promise<string> {
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('x-forwarded-host') ?? h.get('host')
  if (!host) throw new Error('Could not determine this site’s address from the request.')
  return `${proto}://${host}`
}

export async function inviteStaff(input: InviteStaffInput): Promise<InviteStaffResult> {
  const context = await getStaffContext()
  if (!context) throw new Error('You need a room at a center before you can add anyone.')
  if (!canManageStaff(context.role)) throw new Error('Only a director can add a teacher.')

  const email = input.email.trim().toLowerCase()
  const role = input.role as StaffRole
  const classroomIds = roleUsesClassrooms(role) ? input.classroomIds : []

  const admin = createServiceRoleClient()

  // Someone at another center — or a former staff member here — may already
  // hold this email. Re-inviting them would fail loudly on Supabase's side;
  // finding them first lets a person move between centers cleanly instead.
  const existing = await admin.from('app_user').select('id').eq('email', email).maybeSingle()
  if (existing.error)
    throw new Error(`Could not check for an existing account: ${existing.error.message}`)

  let userId: string
  let outcome: InviteStaffResult['outcome']

  if (existing.data) {
    userId = existing.data.id
    outcome = 'addedExisting'
  } else {
    const origin = await requireOrigin()
    const created = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: input.fullName },
      // Not /invite directly — GoTrue's link carries a token_hash only
      // app/auth/confirm/route.ts can redeem. See that file for why.
      redirectTo: `${origin}/auth/confirm?next=/invite`,
    })
    if (created.error) throw new Error(`Could not invite ${email}: ${created.error.message}`)
    const newUserId = created.data.user?.id
    if (!newUserId) throw new Error('Supabase did not return an id for the new account.')
    userId = newUserId

    const profile = await admin
      .from('app_user')
      .insert({ id: userId, email, full_name: input.fullName })
    if (profile.error) throw new Error(`Could not save their profile: ${profile.error.message}`)
    outcome = 'invited'
  }

  // Back to the caller's own client. staff_insert already requires
  // auth_is_director(center_id) — the check above is what makes it safe to
  // trust that policy rather than re-deciding the same thing twice.
  //
  // Note: staff_update additionally requires deleted_at is null, so
  // re-inviting someone soft-deleted from THIS center will not silently
  // reactivate them here. Reactivation is a real feature; it just isn't
  // T-0.5's — nothing below fails unsafely, it simply won't be the row that
  // changes.
  const supabase = await createServerClient()
  const staffRow = await supabase.from('staff').upsert(
    {
      center_id: context.centerId,
      user_id: userId,
      role,
      classroom_ids: classroomIds,
      created_by: context.userId,
    },
    { onConflict: 'center_id,user_id' }
  )
  if (staffRow.error) throw new Error(`Could not add them to your team: ${staffRow.error.message}`)

  return { outcome, email }
}
