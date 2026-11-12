import { useEffect, useState } from "react";
import { linkStudioApi, LinkStudioError, type AnalyticsSummary, type LinkAnalytics } from "../../lib/linkStudio/client";
import { countryName, formatDateTime } from "../../lib/linkStudio/format";
import { Alert } from "../ui/Alert";
import { LoadingState } from "../ui/LoadingState";
import { Button } from "../ui/Button";
import { BreakdownList, DailyClicksChart, StatTile } from "./Charts";

const RANGES = [7, 30, 90, 365];

type State = { kind: "loading" } | { kind: "error"; message: string } | { kind: "summary"; data: AnalyticsSummary } | { kind: "link"; data: LinkAnalytics };

export function AnalyticsView({ code, onSelectLink, onClearLink }: { code: string | null; onSelectLink: (code: string) => void; onClearLink: () => void }) {
  const [days, setDays] = useState(30);
  const [state, setState] = useState<State>({ kind: "loading" });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = code ? linkStudioApi.linkAnalytics(code, days).then((data): State => ({ kind: "link", data })) : linkStudioApi.summary(days).then((data): State => ({ kind: "summary", data }));
    load
      .then((s) => !cancelled && setState(s))
      .catch((err) => !cancelled && setState({ kind: "error", message: err instanceof LinkStudioError ? err.message : "Analytics couldn't be loaded." }));
    return () => {
      cancelled = true;
    };
  }, [code, days, reload]);

  const changeRange = (d: number) => {
    setState({ kind: "loading" });
    setDays(d);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-neutral-900">{code ? `Analytics for /${code}` : "All links"}</h2>
          {code && (
            <button
              type="button"
              onClick={() => {
                setState({ kind: "loading" });
                onClearLink();
              }}
              className="focus-ring w-fit rounded text-xs font-semibold text-brand-700 hover:underline"
            >
              ← Back to all links
            </button>
          )}
        </div>
        <div role="group" aria-label="Date range" className="flex rounded-[var(--radius-control)] border border-neutral-200 bg-white p-0.5">
          {RANGES.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={days === d}
              onClick={() => changeRange(d)}
              className={`focus-ring rounded-md px-3 py-1.5 text-sm font-medium ${days === d ? "bg-brand-600 text-white" : "text-neutral-700 hover:text-brand-700"}`}
            >
              {d === 365 ? "1 year" : `${d} days`}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs leading-5 text-neutral-600">
        Clicks are filtered estimates, not exact counts of people: bots, link previews, prefetches and HEAD requests aren't counted, and repeat clicks within about a minute are usually — not always — counted
        once. Links using 301/308 redirects may be cached by browsers, so some repeat visits never reach the counter. Dates are in UTC.
      </p>

      {state.kind === "loading" && <LoadingState label="Loading analytics…" />}
      {state.kind === "error" && (
        <Alert variant="error" title="Couldn't load analytics">
          <p className="mb-2">{state.message}</p>
          <Button
            variant="secondary"
            onClick={() => {
              setState({ kind: "loading" });
              setReload((n) => n + 1);
            }}
          >
            Try again
          </Button>
        </Alert>
      )}

      {state.kind === "summary" && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile label={`Clicks, last ${state.data.period.days} days`} value={state.data.totals.clicksInPeriod} />
            <StatTile label="Clicks, all time" value={state.data.totals.clicksAllTime} />
            <StatTile label="Links" value={state.data.totals.links} note={`${state.data.totals.activeLinks} active · ${state.data.totals.inactiveLinks} disabled · ${state.data.totals.expiredLinks} expired`} />
            <StatTile label={`New links, last ${state.data.period.days} days`} value={state.data.totals.linksCreatedInPeriod} />
          </div>
          <DailyClicksChart daily={state.data.daily} label="Filtered clicks per day" />
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <section className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-neutral-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-neutral-900">Top links</h3>
              {state.data.topLinks.length === 0 ? (
                <p className="text-sm text-neutral-600">No clicks in this period.</p>
              ) : (
                <ol className="flex flex-col gap-1.5">
                  {state.data.topLinks.map((l) => (
                    <li key={l.code} className="flex items-baseline justify-between gap-2 text-sm">
                      <button type="button" onClick={() => onSelectLink(l.code)} className="focus-ring truncate rounded font-mono text-brand-700 hover:underline">
                        /{l.code}
                      </button>
                      <span className="shrink-0 text-neutral-600 tabular-nums">{l.clicks.toLocaleString()}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
            <BreakdownList title="Referrers" items={state.data.referrers} />
            <BreakdownList title="Countries" items={state.data.countries} nameOf={countryName} />
            <BreakdownList title="Devices" items={state.data.devices} />
          </div>
        </>
      )}

      {state.kind === "link" && (
        <>
          <div className="flex flex-col gap-1 rounded-[var(--radius-card)] border border-neutral-200 bg-white p-4 text-sm">
            <a href={state.data.link.shortUrl} target="_blank" rel="noopener noreferrer" className="font-mono font-semibold break-all text-brand-700 hover:underline">
              {state.data.link.shortUrl}
            </a>
            <span className="break-all text-neutral-600">→ {state.data.link.url}</span>
            <span className="text-xs text-neutral-600">
              Created {formatDateTime(state.data.link.createdAt)} · Last clicked {formatDateTime(state.data.link.lastClickedAt, "never")} · Status: {state.data.link.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatTile label={`Clicks, last ${state.data.period.days} days`} value={state.data.totals.clicksInPeriod} />
            <StatTile label="Clicks, all time" value={state.data.totals.clicksAllTime} />
          </div>
          <DailyClicksChart daily={state.data.daily} label="Filtered clicks per day" />
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <BreakdownList title="Referrers" items={state.data.referrers} />
            <BreakdownList title="Countries" items={state.data.countries} nameOf={countryName} />
            <BreakdownList title="Devices" items={state.data.devices} />
          </div>
        </>
      )}
    </div>
  );
}
