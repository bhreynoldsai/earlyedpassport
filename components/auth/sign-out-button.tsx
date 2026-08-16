'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { copy } from '@/lib/copy'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <Button
      variant="quiet"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        await createClient().auth.signOut()
        router.push('/sign-in')
        router.refresh()
      }}
    >
      {copy.auth.signOut}
    </Button>
  )
}
