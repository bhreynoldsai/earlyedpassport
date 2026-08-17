'use server'

import { inviteStaff, type InviteStaffResult } from '@/lib/auth/invite-staff'
import { inviteStaffSchema } from '@/lib/auth/schemas'
import { enrollChild, type EnrollChildResult } from '@/lib/child/enroll-child'
import { enrollChildSchema } from '@/lib/child/schemas'

export interface InviteStaffActionResult {
  ok: boolean
  outcome?: InviteStaffResult['outcome']
  email?: string
  error?: string
}

/**
 * The thin 'use server' boundary Next.js requires. Every real decision —
 * the director check, the service-role use, the staff row — lives in
 * lib/auth/invite-staff.ts, where it can be read (and, if it ever needs to
 * be, reused) without Next.js's server-action machinery in the way.
 */
export async function inviteStaffAction(input: unknown): Promise<InviteStaffActionResult> {
  const parsed = inviteStaffSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'That didn’t look right.' }
  }

  try {
    const result = await inviteStaff(parsed.data)
    return { ok: true, outcome: result.outcome, email: result.email }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Something went wrong.' }
  }
}

export interface EnrollChildActionResult {
  ok: boolean
  childId?: EnrollChildResult['childId']
  error?: string
}

/** Same thin boundary as inviteStaffAction — the real decisions live in lib/child/enroll-child.ts. */
export async function enrollChildAction(input: unknown): Promise<EnrollChildActionResult> {
  const parsed = enrollChildSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'That didn’t look right.' }
  }

  try {
    const result = await enrollChild(parsed.data)
    return { ok: true, childId: result.childId }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Something went wrong.' }
  }
}
