import { notFound } from 'next/navigation'
import { getStaffContext } from '@/lib/auth/session'
import { getChild } from '@/lib/child/session'
import { copy } from '@/lib/copy'
import { todayUtc } from '@/lib/week'

/**
 * Years and months as of today. dateOfBirth and todayUtc() are both plain
 * YYYY-MM-DD strings; the `Date` constructor parses a date-only ISO string
 * as UTC midnight per spec, so both read directly rather than hand-splitting.
 */
function ageFromBirthDate(dateOfBirth: string): string {
  const dob = new Date(dateOfBirth)
  const now = new Date(todayUtc())
  let years = now.getUTCFullYear() - dob.getUTCFullYear()
  let months = now.getUTCMonth() - dob.getUTCMonth()
  if (now.getUTCDate() < dob.getUTCDate()) months -= 1
  if (months < 0) {
    years -= 1
    months += 12
  }
  return years > 0 ? `${years}y ${months}mo` : `${months}mo`
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[length:var(--text-small)] text-text-muted">{label}</p>
      <p className="text-[length:var(--text-body-lg)]">{value}</p>
    </div>
  )
}

export default async function ChildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const context = await getStaffContext()
  // AppLayout already gates on this — reachable only if context exists.
  if (!context) throw new Error('AppLayout rendered children without a staff context.')

  const child = await getChild(context.centerId, id)
  if (!child) notFound()

  const name = child.preferredName ?? child.firstName

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[length:var(--text-small)] text-text-faint uppercase">
          {copy.child.tabBasics}
        </p>
        <h1 className="text-[length:var(--text-h1)] font-semibold">
          {name} {child.lastName}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {child.namePronunciation && (
          <Field label={copy.child.howToSayIt} value={child.namePronunciation} />
        )}
        <Field
          label={copy.children.dateOfBirth}
          value={`${child.dateOfBirth} (${ageFromBirthDate(child.dateOfBirth)})`}
        />
        {child.homeLanguage && (
          <Field label={copy.children.homeLanguage} value={child.homeLanguage} />
        )}
        <Field
          label={copy.children.classroom}
          value={child.classroomName ?? copy.children.noRoom}
        />
      </div>
    </div>
  )
}
