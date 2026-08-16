'use client'

/**
 * Shared by /invite and /reset-password. Ticket T-0.5.
 *
 * By the time this renders, `app/auth/confirm/route.ts` has already redeemed
 * the emailed link and set a session cookie — this form only ever calls
 * `updateUser({ password })` against an already-authenticated session. It
 * never sees, and never needs, the token from the email.
 *
 * That also means it has to handle arriving with NO session gracefully: an
 * old tab, a link clicked twice, someone typing the URL from memory.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { copy } from '@/lib/copy'
import { setPasswordSchema, type SetPasswordInput } from '@/lib/auth/schemas'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'

type CheckState = 'checking' | 'ready' | 'no-session'

export function SetPasswordForm({ variant }: { variant: 'invite' | 'reset' }) {
  const [check, setCheck] = useState<CheckState>('checking')

  useEffect(() => {
    let cancelled = false
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (!cancelled) setCheck(user ? 'ready' : 'no-session')
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (check === 'checking') {
    return <p className="text-[length:var(--text-body)] text-text-muted">{copy.states.loading}</p>
  }

  if (check === 'no-session') {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[length:var(--text-body-lg)] text-text">{copy.auth.noSessionHere}</p>
        <Link href="/sign-in">
          <Button variant="secondary" className="w-full">
            {copy.auth.backToSignIn}
          </Button>
        </Link>
      </div>
    )
  }

  return <PasswordForm variant={variant} />
}

function PasswordForm({ variant }: { variant: 'invite' | 'reset' }) {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordInput>({ resolver: zodResolver(setPasswordSchema) })

  const onSubmit = handleSubmit(async ({ password }) => {
    setFormError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setFormError(copy.states.somethingWentWrong)
      return
    }
    setSaved(true)
    router.push('/home')
    router.refresh()
  })

  if (saved) {
    return <p className="text-[length:var(--text-body-lg)] text-text">{copy.auth.passwordSaved}</p>
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <h1 className="text-[length:var(--text-h1)] font-semibold">
        {variant === 'invite' ? copy.auth.welcomeSetPassword : copy.auth.pickNewPassword}
      </h1>
      <TextField
        label={copy.auth.newPassword}
        type="password"
        autoComplete="new-password"
        hint={copy.auth.passwordHint}
        error={errors.password?.message}
        {...register('password')}
      />
      <TextField
        label={copy.auth.confirmPassword}
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      {formError && (
        <p role="alert" className="text-[length:var(--text-small)] text-attention">
          {formError}
        </p>
      )}
      <Button type="submit" className="w-full">
        {copy.auth.savePassword}
      </Button>
    </form>
  )
}
