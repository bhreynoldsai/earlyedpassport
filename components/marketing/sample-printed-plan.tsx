interface PrintedDay {
  day: string
  activity: string
  domain: string
}

interface SamplePrintedPlanProps {
  center: string
  room: string
  teacher: string
  weekOf: string
  theme: string
  days: PrintedDay[]
}

/**
 * A sample printed weekly plan — a stand-in for a real product screenshot
 * until one exists (see plate.tsx's TODO). Rendered literally black on
 * white rather than in the site's warm palette: the paragraph above this on
 * How It Works specifies the real printed plan is "black on white, 11pt",
 * the same rule app/globals.css's own @media print block enforces for the
 * live app, so an accent-tinted mockup here would misrepresent what
 * actually comes out of the printer. The outer mat keeps it reading as a
 * plate within the page even though the sheet itself carries no site color.
 */
export function SamplePrintedPlan({
  center,
  room,
  teacher,
  weekOf,
  theme,
  days,
}: SamplePrintedPlanProps) {
  return (
    <div className="border-[6px] border-classical-surface p-1 shadow-classical-md outline outline-1 outline-classical-divider">
      <div className="flex flex-col gap-3 bg-white p-5 text-black">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-black/20 pb-2 text-[10px] tracking-wide text-black/60 uppercase">
          <span>{center}</span>
          <span>{room}</span>
          <span>{teacher}</span>
          <span>Week of {weekOf}</span>
          <span className="font-semibold text-black">{theme}</span>
        </div>
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr>
              {days.map((d) => (
                <th
                  key={d.day}
                  className="border border-black/20 bg-black/[0.03] p-2 text-left font-semibold"
                >
                  {d.day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {days.map((d) => (
                <td key={d.day} className="border border-black/20 p-2 align-top">
                  <p>{d.activity}</p>
                  <p className="mt-1 text-[9px] tracking-wide text-black/50 uppercase">
                    {d.domain}
                  </p>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
