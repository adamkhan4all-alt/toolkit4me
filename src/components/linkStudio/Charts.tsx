import { useId, useState } from "react";
import type { DailyCount, NamedCount } from "../../lib/linkStudio/client";
import { formatDay } from "../../lib/linkStudio/format";

/**
 * Daily clicks: one series, one hue (brand), thin bars with a 2px gap and rounded data-ends
 * anchored to the baseline, a recessive grid, a per-bar hover/focus tooltip, and a table view.
 */
export function DailyClicksChart({ daily, label }: { daily: DailyCount[]; label: string }) {
  const id = useId();
  const [active, setActive] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const max = Math.max(1, ...daily.map((d) => d.clicks));
  const niceMax = max <= 4 ? 4 : Math.ceil(max / 4) * 4;
  const W = 640;
  const H = 180;
  const padL = 32;
  const padB = 22;
  const plotW = W - padL;
  const plotH = H - padB - 8;
  const slot = plotW / Math.max(daily.length, 1);
  const barW = Math.max(1, slot - 2);
  const ticks = [0, niceMax / 2, niceMax];
  const labelEvery = Math.ceil(daily.length / 6);
  const total = daily.reduce((s, d) => s + d.clicks, 0);
  const current = active !== null ? daily[active] : null;

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-neutral-900">{label}</span>
        <button type="button" onClick={() => setShowTable((v) => !v)} className="focus-ring rounded text-xs font-semibold text-brand-700 hover:underline" aria-expanded={showTable} aria-controls={`${id}-table`}>
          {showTable ? "Show chart" : "Show as table"}
        </button>
      </figcaption>
      {showTable ? (
        <div id={`${id}-table`} className="max-h-72 overflow-auto rounded-lg border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-neutral-100">
              <tr>
                <th scope="col" className="px-3 py-1.5 font-semibold">
                  Date
                </th>
                <th scope="col" className="px-3 py-1.5 text-right font-semibold">
                  Clicks
                </th>
              </tr>
            </thead>
            <tbody>
              {daily.map((d) => (
                <tr key={d.date} className="border-t border-neutral-200">
                  <td className="px-3 py-1">{formatDay(d.date)}</td>
                  <td className="px-3 py-1 text-right tabular-nums">{d.clicks.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${label}: ${total.toLocaleString()} clicks over ${daily.length} days, peak ${max.toLocaleString()} in a day.`} onMouseLeave={() => setActive(null)}>
            {ticks.map((t) => {
              const y = 8 + plotH - (t / niceMax) * plotH;
              return (
                <g key={t}>
                  <line x1={padL} x2={W} y1={y} y2={y} className="stroke-neutral-200" strokeWidth={1} />
                  <text x={padL - 6} y={y + 4} textAnchor="end" className="fill-neutral-500 text-[11px]">
                    {t}
                  </text>
                </g>
              );
            })}
            {daily.map((d, i) => {
              const h = (d.clicks / niceMax) * plotH;
              const x = padL + i * slot + 1;
              const y = 8 + plotH - h;
              const r = Math.min(4, barW / 2, h);
              return (
                <g key={d.date}>
                  {d.clicks > 0 && (
                    <path
                      d={`M${x},${8 + plotH} V${y + r} Q${x},${y} ${x + r},${y} H${x + barW - r} Q${x + barW},${y} ${x + barW},${y + r} V${8 + plotH} Z`}
                      className={active === i ? "fill-brand-700" : "fill-brand-600"}
                    />
                  )}
                  {/* Hit target: the full column, larger than the mark. */}
                  <rect
                    x={padL + i * slot}
                    y={0}
                    width={slot}
                    height={H - padB}
                    fill="transparent"
                    tabIndex={0}
                    aria-label={`${formatDay(d.date)}: ${d.clicks} clicks`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    className="focus:outline-none"
                  />
                  {i % labelEvery === 0 && (
                    <text x={x + barW / 2} y={H - 6} textAnchor="middle" className="fill-neutral-500 text-[11px]">
                      {formatDay(d.date)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          {current && active !== null && (
            <div
              role="status"
              className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs whitespace-nowrap text-neutral-900 shadow-sm"
              style={{ left: `${((padL + active * slot + slot / 2) / W) * 100}%` }}
            >
              <span className="font-semibold tabular-nums">{current.clicks.toLocaleString()}</span> clicks · {formatDay(current.date)}
            </div>
          )}
        </div>
      )}
    </figure>
  );
}

/** Horizontal bars for a breakdown (referrers, countries, devices). Values and labels in text ink; the bar carries magnitude. */
export function BreakdownList({ title, items, nameOf = (n) => n, empty = "No clicks in this period." }: { title: string; items: NamedCount[]; nameOf?: (name: string) => string; empty?: string }) {
  const max = Math.max(1, ...items.map((i) => i.clicks));
  const total = items.reduce((s, i) => s + i.clicks, 0);
  return (
    <section className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-neutral-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-600">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.name} className="flex flex-col gap-1" title={`${nameOf(item.name)}: ${item.clicks.toLocaleString()} clicks`}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="truncate text-neutral-900">{nameOf(item.name)}</span>
                <span className="shrink-0 text-neutral-600 tabular-nums">
                  {item.clicks.toLocaleString()} <span className="text-xs">({total ? Math.round((item.clicks / total) * 100) : 0}%)</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-neutral-100" aria-hidden="true">
                <div className="h-1.5 rounded-full bg-brand-600" style={{ width: `${(item.clicks / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Stat tile: a headline number with its label. */
export function StatTile({ label, value, note }: { label: string; value: number | string; note?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-[var(--radius-card)] border border-neutral-200 bg-white p-4">
      <span className="text-xs font-medium text-neutral-600">{label}</span>
      <span className="text-2xl font-bold text-neutral-900 tabular-nums">{typeof value === "number" ? value.toLocaleString() : value}</span>
      {note && <span className="text-xs text-neutral-600">{note}</span>}
    </div>
  );
}
