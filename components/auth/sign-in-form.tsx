'use client'

/**
 * Sign in, and "I forgot my password" as a mode toggle on the same screen
 * rather than a separate route. `lib/supabase/middleware.ts` only allowlists
 * `/sign-in` as public — a second public route would need its own entry and
 * its own reason to exist, and this doesn't need one.
 */

import { useState } from 'react'
import type { Route } from 'next'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { copy } from '@/lib/copy'
import { requestResetSchema, signInSchema, type SignInInput } from '@/lib/auth/schemas'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'

/**
 * `lib/supabase/middleware.ts` sends an unauthenticated visit to a protected
 * page here as `?next=<that page>`, specifically "so she lands back where she
 * was trying to go, not on a generic home page" (its own comment). Honouring
 * it here is what keeps that promise. Restricted to a single leading slash —
 * `next` is echoed straight from the URL, so anything else (`//evil.com`,
 * `https://…`) would turn a sign-in link into an open redirect.
 */
function safeNext(value: string | null): Route {
  // typedRoutes can only verify literals; this is checked at runtime instead,
  // which is the actual safety property here — `as Route` just tells the
  // compiler what the check above already guarantees.
  if (value && value.startsWith('/') && !value.startsWith('//')) return value as Route
  return '/home'
}

export function SignInForm() {
  const [mode, setMode] = useState<'sign-in' | 'forgot'>('sign-in')

  return mode === 'forgot' ? (
    <ForgotPasswordForm onDone={() => setMode('sign-in')} />
  ) : (
    <PasswordSignInForm onForgot={() => setMode('forgot')} />
  )
}

function PasswordSignInForm({ onForgot }: { onForgot: () => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Set by app/auth/confirm/route.ts when an invite or reset link no longer
  // works. A notice, not a form error — nothing on this screen was submitted.
  const [formError, setFormError] = useState<string | null>(
    searchParams.get('expired') ? copy.auth.linkExpired : null
  )
  const [pending, setPending] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    setPending(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword(values)
    if (error) {
      // Supabase's own message names which field was wrong and uses banned
      // vocabulary besides — never shown. See tests/unit/copy.test.ts.
      setFormError(copy.auth.wrongCredentials)
      setPending(false)
      return
    }
    router.push(safeNext(searchParams.get('next')))
    router.refresh()
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <h1 className="text-[length:var(--text-h1)] font-semibold">{copy.auth.signIn}</h1>
      <TextField
        label={copy.auth.email}
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label={copy.auth.password}
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      {formError && (
        <p role="alert" className="text-[length:var(--text-small)] text-attention">
          {formError}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? copy.auth.signingIn : copy.auth.signIn}
      </Button>
      <button
        type="button"
        onClick={onForgot}
        className="text-[length:var(--text-body)] text-accent-text hover:underline"
      >
        {copy.auth.forgot}
      </button>
    </form>
  )
}

function ForgotPasswordForm({ onDone }: { onDone: () => void }) {
  const [sent, setSent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({ resolver: zodResolver(requestResetSchema) })

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[length:var(--text-body-lg)] text-text">{copy.auth.checkEmail}</p>
        <Button variant="secondary" className="w-full" onClick={onDone}>
          {copy.auth.backToSignIn}
        </Button>
      </div>
    )
  }

  const onSubmit = handleSubmit(async ({ email }) => {
    setFormError(null)
    setPending(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Routed through the confirm handler — see app/auth/confirm/route.ts.
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
    })
    setPending(false)
    if (error) {
      setFormError(copy.states.somethingWentWrong)
      return
    }
    setSent(true)
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <h1 className="text-[length:var(--text-h1)] font-semibold">{copy.auth.forgot}</h1>
      <p className="text-[length:var(--text-body)] text-text-muted">{copy.auth.resetIntro}</p>
      <TextField
        label={copy.auth.email}
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      {formError && (
        <p role="alert" className="text-[length:var(--text-small)] text-attention">
          {formError}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? copy.states.loading : copy.auth.sendResetLink}
      </Button>
      <button
        type="button"
        onClick={onDone}
        className="text-[length:var(--text-body)] text-accent-text hover:underline"
      >
        {copy.auth.backToSignIn}
      </button>
    </form>
  )
}
