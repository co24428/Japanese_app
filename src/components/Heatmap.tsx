/**
 * The GitHub-style activity map: one square per day, darker = more XP.
 *
 * A server component: it is plain HTML and CSS, no JavaScript in the
 * browser. The grid is laid out by buildHeatmap() in src/lib/streak.ts.
 */
import type { Heatmap as HeatmapData } from "@/lib/streak";

const LEVEL_COLORS = ["var(--heat-0)", "var(--heat-1)", "var(--heat-2)", "var(--heat-3)", "var(--heat-4)"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function describe(day: string, xp: number): string {
  const date = new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return xp > 0 ? `${date}: ${xp} XP` : `${date}: no practice`;
}

export function Heatmap({ data }: { data: HeatmapData }) {
  return (
    <div>
      <div className="flex gap-2">
        {/* Weekday labels down the left side. */}
        <div className="mt-5 grid shrink-0 grid-rows-7 gap-[3px] text-[10px] leading-3 text-muted" aria-hidden="true">
          {DAY_LABELS.map((label, i) => (
            <span key={i} className="h-3">
              {label}
            </span>
          ))}
        </div>

        {/*
          Showing only as many weeks as fit, newest on the right:
          the weeks are listed newest-first in a right-to-left flex row that
          is allowed to wrap, but the box is exactly one row tall. Weeks that
          do not fit wrap onto a second row, which is hidden. So a narrow
          phone shows the last few months, a laptop most of the year, and
          never half a column.
        */}
        <div
          className="flex h-[calc(1rem+7*0.75rem+7*3px)] min-w-0 flex-1 flex-row-reverse flex-wrap gap-x-[3px] gap-y-8 overflow-hidden"
          role="img"
          aria-label="Practice activity over the past year"
        >
          {data.weeks
            .map((week, w) => (
              <div key={w} className="flex flex-col gap-[3px]">
                <span className="h-4 text-[10px] leading-4 whitespace-nowrap text-muted" aria-hidden="true">
                  {/* w-3 keeps the column narrow; the label overflows to the right. */}
                  <span className="block w-3 overflow-visible">{data.monthLabels[w] ?? ""}</span>
                </span>
                {week.map((cell) => (
                  <span
                    key={cell.day}
                    title={cell.future ? undefined : describe(cell.day, cell.xp)}
                    className="size-3 rounded-[3px]"
                    style={{ background: cell.future ? "transparent" : LEVEL_COLORS[cell.level] }}
                  />
                ))}
              </div>
            ))
            .reverse()}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-muted">
        Less
        {LEVEL_COLORS.map((color) => (
          <span key={color} className="size-3 rounded-[3px]" style={{ background: color }} />
        ))}
        More
      </div>
    </div>
  );
}
