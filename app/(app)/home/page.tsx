import { canManageStaff } from '@/lib/auth/authorize'
import { getCenterClassrooms, getCenterStaff, getStaffContext } from '@/lib/auth/session'
import { copy } from '@/lib/copy'
import { InviteStaffForm } from '@/components/auth/invite-staff-form'

/**
 * The signed-in home screen. Ticket T-0.5's done-when is "a director can
 * invite a teacher who can log in and see only her rooms" — this page is
 * the smallest thing that proves all three clauses of that sentence at once,
 * not a first draft of the Roster or Director Dashboard from DESIGN-BRIEF §5.
 * Those are real, later tickets with their own specs.
 */
export default async function AppHomePage() {
  const context = await getStaffContext()
  // AppLayout already gates on this — reachable only if context exists.
  if (!context) throw new Error('AppLayout rendered children without a staff context.')

  const team = await getCenterStaff(context.centerId)
  const canInvite = canManageStaff(context.role)
  const rooms = canInvite ? await getCenterClassrooms(context.centerId) : []

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-[length:var(--text-h1)] font-semibold">
          {copy.home.greeting(context.fullName ?? context.email)}
        </p>
        <p className="text-[length:var(--text-body)] text-text-muted">
          {copy.home.roleAtCenter(copy.auth.roleNames[context.role], context.centerName)}
        </p>
        {context.hasOtherCenters && (
          <p className="mt-1 text-[length:var(--text-small)] text-text-faint">
            {copy.home.moreThanOneCenter}
          </p>
        )}
      </div>

      {context.classrooms.length > 0 && (
        <section>
          <h2 className="mb-2 text-[length:var(--text-h2)] font-semibold">{copy.home.yourRooms}</h2>
          <ul className="flex flex-col gap-1">
            {context.classrooms.map((room) => (
              <li key={room.id} className="text-[length:var(--text-body)]">
                {room.name}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-[length:var(--text-h2)] font-semibold">{copy.team.title}</h2>
        <ul className="flex flex-col gap-1">
          {team.map((member) => (
            <li key={member.staffId} className="text-[length:var(--text-body)]">
              {member.fullName ?? member.email}
              <span className="ml-2 text-[length:var(--text-small)] text-text-muted">
                {copy.auth.roleNames[member.role]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {canInvite && (
        <section className="rounded-md border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
          <InviteStaffForm rooms={rooms} />
        </section>
      )}
    </div>
  )
}
