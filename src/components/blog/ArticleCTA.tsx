import { Link } from "react-router-dom";
import { blogToolInfo, PROCESSING_LABEL } from "../../lib/blog/tools";

/** One understated call to action for the article's main tool — the only promotional box in an article. */
export function ArticleCTA({ toolId, lead }: { toolId: string; lead?: string }) {
  const info = blogToolInfo(toolId);
  if (!info) return null;
  return (
    <aside aria-label={`Try ${info.listing.name}`} className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-brand-100 bg-brand-50 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-neutral-900">{lead ?? `Try ${info.listing.name}`}</p>
        <p className="text-sm leading-6 text-neutral-700">{info.listing.description}</p>
        <p className="text-xs text-neutral-600">Free, no account needed · {PROCESSING_LABEL[info.processing]}</p>
      </div>
      <Link
        to={info.path}
        className="focus-ring inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-brand-600 px-4 text-[15px] font-medium text-white hover:bg-brand-700"
      >
        Open {info.listing.shortName}
      </Link>
    </aside>
  );
}
