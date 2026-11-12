import { Link } from "react-router-dom";
import { listingPath, type ToolListing } from "../../types/tool";
import { getHub } from "../../data/hubs";

/**
 * Responsive by default — no separate "compact" component. Below `sm` this
 * renders a single compact row (icon + name + category label + arrow, no
 * long description) so mobile tool discovery doesn't require scrolling
 * past paragraphs of copy per tool; at `sm` and up it renders the full
 * card with the marketing description. Both are the same <Link>, so every
 * page that uses ToolCard (homepage, category pages, All Tools) gets the
 * compact treatment on mobile automatically.
 */
export function ToolCard({ tool }: { tool: ToolListing }) {
  return (
    <Link
      to={listingPath(tool)}
      className="focus-ring card-lift group flex min-h-[44px] items-center gap-3 rounded-[var(--radius-card)] border border-neutral-200 bg-white p-3 hover:border-brand-100 sm:flex-col sm:items-stretch sm:gap-3 sm:p-5"
    >
      <span
        aria-hidden="true"
        className={`inline-flex h-9 w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-2 text-xs font-bold tracking-tight sm:h-auto sm:px-2.5 sm:py-1 ${getHub(tool.hub).accent}`}
      >
        {tool.icon}
      </span>

      <span className="flex min-w-0 flex-1 flex-col sm:contents">
        <h3 className="truncate text-sm font-semibold text-neutral-900 group-hover:text-brand-600 sm:text-lg">
          {tool.shortName}
        </h3>
        <span className="truncate text-xs text-neutral-600 sm:hidden">{tool.categoryLabel}</span>
        <p className="hidden text-sm text-neutral-600 sm:block">{tool.description}</p>
      </span>

      <span aria-hidden="true" className="shrink-0 text-neutral-400 sm:hidden">
        →
      </span>
    </Link>
  );
}
