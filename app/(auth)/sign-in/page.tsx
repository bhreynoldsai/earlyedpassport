import { Suspense } from 'react'
import { SignInForm } from '@/components/auth/sign-in-form'

/**
 * `SignInForm` reads `?expired=1` via `useSearchParams()`, which requires a
 * Suspense boundary — without one this route would deopt entirely out of
 * static rendering instead of just the piece that actually needs it.
 */
export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}
