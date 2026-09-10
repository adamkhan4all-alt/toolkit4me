interface DeterminateProps {
  variant: "determinate";
  percent: number;
  label?: string;
}

interface IndeterminateProps {
  variant: "indeterminate";
  label?: string;
}

type ProgressIndicatorProps = DeterminateProps | IndeterminateProps;

/**
 * Progress bar used across all tool workspaces.
 * - "determinate": real, measurable percentage (e.g. client-side upload progress).
 * - "indeterminate": used whenever true progress can't be measured (server-side
 *   processing) — never fakes a percentage per the UI/UX spec.
 */
export function ProgressIndicator(props: ProgressIndicatorProps) {
  return (
    <div className="w-full" role="progressbar" aria-live="polite" aria-label={props.label ?? "Progress"}>
      {props.label && <p className="mb-2 text-sm text-neutral-600">{props.label}</p>}
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
        {props.variant === "determinate" ? (
          <div
            className="h-full rounded-full bg-brand-600 transition-[width] duration-300"
            style={{ width: `${Math.min(100, Math.max(0, props.percent))}%` }}
          />
        ) : (
          <div className="relative h-full w-full">
            <div className="animate-indeterminate absolute h-full w-1/3 rounded-full bg-brand-600" />
          </div>
        )}
      </div>
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-600" role="status" aria-live="polite">
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-brand-600"
        aria-hidden="true"
      />
      {label}
    </div>
  );
}
