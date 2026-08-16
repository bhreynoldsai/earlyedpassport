/**
 * Auth form validation. Ticket T-0.5.
 *
 * Zod's default messages ("Invalid email", "String must contain at least 1
 * character(s)") use words this product bans everywhere else a person reads
 * them (BUILD-INSTRUCTIONS §7.2 — no "invalid"). Every message here is
 * written the same way lib/copy.ts is: plain, short, no jargon.
 */

import { z } from 'zod'
import { Constants } from '../supabase/database.types'

const STAFF_ROLES = Constants.public.Enums.staff_role

const email = z
  .string()
  .min(1, 'Add an email address.')
  .email('That doesn’t look like an email address.')

/** Supabase's own floor is 6. Eight is a small, easy-to-explain step up. */
const password = z.string().min(8, 'Use at least 8 characters.')

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Add your password.'),
})
export type SignInInput = z.infer<typeof signInSchema>

export const requestResetSchema = z.object({ email })
export type RequestResetInput = z.infer<typeof requestResetSchema>

export const setPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string().min(1, 'Type it one more time.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Those two don’t match.',
    path: ['confirmPassword'],
  })
export type SetPasswordInput = z.infer<typeof setPasswordSchema>

export const inviteStaffSchema = z.object({
  email,
  fullName: z.string().min(1, 'Add a name.'),
  role: z.enum(STAFF_ROLES, {
    errorMap: () => ({ message: 'Pick a role.' }),
  }),
  classroomIds: z.array(z.string().uuid()).default([]),
})
export type InviteStaffInput = z.infer<typeof inviteStaffSchema>
