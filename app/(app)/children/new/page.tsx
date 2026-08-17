import { canEnrollChild } from '@/lib/auth/authorize'
import { getCenterClassrooms, getStaffContext } from '@/lib/auth/session'
import { copy } from '@/lib/copy'
import { EnrollChildForm } from '@/components/child/enroll-child-form'

export default async function NewChildPage() {
  const context = await getStaffContext()
  // AppLayout already gates on this — reachable only if context exists.
  if (!context) throw new Error('AppLayout rendered children without a staff context.')

  // Mirrors enroll-child.ts's own check — this is the friendly page a
  // teacher sees if she reaches the route directly, not the enforcement
  // itself. `enrollment_insert`'s RLS policy is that.
  if (!canEnrollChild(context.role)) {
    return <p className="text-[length:var(--text-body-lg)]">{copy.children.onlyDirectorsCanAdd}</p>
  }

  const rooms = await getCenterClassrooms(context.centerId)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[length:var(--text-h1)] font-semibold">{copy.children.addChild}</h1>
      <EnrollChildForm rooms={rooms} />
    </div>
  )
}
