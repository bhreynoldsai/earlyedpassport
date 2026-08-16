'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Constants } from '@/lib/supabase/database.types'
import { roleUsesClassrooms, type StaffRole } from '@/lib/auth/authorize'
import { inviteStaffSchema, type InviteStaffInput } from '@/lib/auth/schemas'
import { copy } from '@/lib/copy'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { inviteStaffAction } from '@/app/(app)/actions'

const ROLES = Constants.public.Enums.staff_role

interface RoomOption {
  id: string
  name: string
}

export function InviteStaffForm({ rooms }: { rooms: RoomOption[] }) {
  const [pending, setPending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<InviteStaffInput>({
    resolver: zodResolver(inviteStaffSchema),
    defaultValues: { classroomIds: [] },
  })

  const selectedRole = watch('role') as StaffRole | undefined
  const showRooms = selectedRole ? roleUsesClassrooms(selectedRole) : false

  const onSubmit = handleSubmit(async (values) => {
    setPending(true)
    setFormError(null)
    setConfirmation(null)
    const result = await inviteStaffAction(values)
    setPending(false)
    if (!result.ok || !result.email) {
      setFormError(result.error ?? copy.states.somethingWentWrong)
      return
    }
    setConfirmation(
      result.outcome === 'invited'
        ? copy.team.inviteSent(result.email)
        : copy.team.addedToTeam(result.email)
    )
    reset({ email: '', fullName: '', role: undefined, classroomIds: [] })
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <h2 className="text-[length:var(--text-h2)] font-semibold">{copy.team.addTeacher}</h2>
      <TextField
        label={copy.team.fullName}
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <TextField
        label={copy.auth.email}
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <div className="flex flex-col gap-1">
        <label
          htmlFor="invite-role"
          className="text-[length:var(--text-body)] font-medium text-text"
        >
          {copy.team.role}
        </label>
        <select
          id="invite-role"
          defaultValue=""
          className="min-h-[var(--tap-min)] rounded-sm border border-border-strong bg-surface px-3 text-[length:var(--text-body-lg)] text-text"
          {...register('role')}
        >
          <option value="" disabled>
            {copy.team.pickRole}
          </option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {copy.auth.roleNames[role]}
            </option>
          ))}
        </select>
        {errors.role && (
          <p className="text-[length:var(--text-small)] text-attention">{errors.role.message}</p>
        )}
      </div>
      {showRooms && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-[length:var(--text-body)] font-medium text-text">
            {copy.team.rooms}
          </legend>
          {rooms.length === 0 ? (
            <p className="text-[length:var(--text-small)] text-text-muted">
              {copy.team.noRoomsAssigned}
            </p>
          ) : (
            rooms.map((room) => (
              <label
                key={room.id}
                className="flex items-center gap-2 text-[length:var(--text-body)]"
              >
                <input type="checkbox" value={room.id} {...register('classroomIds')} />
                {room.name}
              </label>
            ))
          )}
        </fieldset>
      )}
      {formError && (
        <p role="alert" className="text-[length:var(--text-small)] text-attention">
          {formError}
        </p>
      )}
      {confirmation && (
        <p role="status" className="text-[length:var(--text-small)] text-good">
          {confirmation}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? copy.team.sendingInvite : copy.team.sendInvite}
      </Button>
    </form>
  )
}
