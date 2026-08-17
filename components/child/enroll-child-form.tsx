'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { enrollChildSchema, type EnrollChildInput } from '@/lib/child/schemas'
import { copy } from '@/lib/copy'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { enrollChildAction } from '@/app/(app)/actions'

interface RoomOption {
  id: string
  name: string
}

export function EnrollChildForm({ rooms }: { rooms: RoomOption[] }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnrollChildInput>({ resolver: zodResolver(enrollChildSchema) })

  const onSubmit = handleSubmit(async (values) => {
    setPending(true)
    setFormError(null)
    const result = await enrollChildAction(values)
    setPending(false)
    if (!result.ok || !result.childId) {
      setFormError(result.error ?? copy.states.somethingWentWrong)
      return
    }
    router.push(`/children/${result.childId}`)
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <TextField
        label={copy.children.firstName}
        error={errors.firstName?.message}
        {...register('firstName')}
      />
      <TextField
        label={copy.children.lastName}
        error={errors.lastName?.message}
        {...register('lastName')}
      />
      <TextField
        label={copy.children.preferredName}
        error={errors.preferredName?.message}
        {...register('preferredName')}
      />
      <TextField
        label={copy.child.howToSayIt}
        error={errors.namePronunciation?.message}
        {...register('namePronunciation')}
      />
      <TextField
        label={copy.children.dateOfBirth}
        type="date"
        error={errors.dateOfBirth?.message}
        {...register('dateOfBirth')}
      />
      <TextField
        label={copy.children.homeLanguage}
        error={errors.homeLanguage?.message}
        {...register('homeLanguage')}
      />
      <div className="flex flex-col gap-1">
        <label
          htmlFor="child-classroom"
          className="text-[length:var(--text-body)] font-medium text-text"
        >
          {copy.children.classroom}
        </label>
        <select
          id="child-classroom"
          defaultValue=""
          className="min-h-[var(--tap-min)] rounded-sm border border-border-strong bg-surface px-3 text-[length:var(--text-body-lg)] text-text"
          {...register('classroomId')}
        >
          <option value="" disabled>
            {copy.children.pickClassroom}
          </option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
        {errors.classroomId && (
          <p className="text-[length:var(--text-small)] text-attention">
            {errors.classroomId.message}
          </p>
        )}
      </div>
      {formError && (
        <p role="alert" className="text-[length:var(--text-small)] text-attention">
          {formError}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? copy.children.saving : copy.children.save}
      </Button>
    </form>
  )
}
