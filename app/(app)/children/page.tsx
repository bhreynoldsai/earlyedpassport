import Link from 'next/link'
import { canEnrollChild } from '@/lib/auth/authorize'
import { getStaffContext } from '@/lib/auth/session'
import { getCenterChildren } from '@/lib/child/session'
import { copy } from '@/lib/copy'

export default async function ChildrenPage() {
  const context = await getStaffContext()
  // AppLayout already gates on this — reachable only if context exists.
  if (!context) throw new Error('AppLayout rendered children without a staff context.')

  const children = await getCenterChildren(context.centerId)
  const canAdd = canEnrollChild(context.role)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[length:var(--text-h1)] font-semibold">{copy.children.title}</h1>
        {canAdd && (
          <Link
            href="/children/new"
            className="inline-flex min-h-[var(--tap-primary)] items-center justify-center rounded-sm bg-accent px-6 text-[length:var(--text-body-lg)] font-semibold text-white hover:bg-accent-hover"
          >
            {copy.children.addChild}
          </Link>
        )}
      </div>

      {children.length === 0 ? (
        <p className="text-[length:var(--text-body)] text-text-muted">{copy.children.empty}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {children.map((child) => (
            <li key={child.id}>
              <Link
                href={`/children/${child.id}`}
                className="flex items-center justify-between rounded-sm px-2 py-3 text-[length:var(--text-body-lg)] hover:bg-surface-sunk"
              >
                <span>
                  {child.preferredName ?? child.firstName} {child.lastName}
                </span>
                <span className="text-[length:var(--text-small)] text-text-muted">
                  {child.classroomName ?? copy.children.noRoom}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
