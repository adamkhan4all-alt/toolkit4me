import { Link } from "react-router-dom";
import { getHub } from "../../data/hubs";
import { blogToolInfo, blogTools, PROCESSING_LABEL } from "../../lib/blog/tools";

/**
 * A real Toolkit4Me tool or calculator, resolved from its registry id. It opens the tool's own page on
 * this site, in the same tab, and states up front whether the work happens in the browser or on our server.
 */
export function RecommendedToolCard({ id }: { id: string }) {
  const info = blogToolInfo(id);
  if (!info) return null;
  const { listing, path, hubName, processing } = info;
  return (
    <Link
      to={path}
      className="focus-ring card-lift group flex h-full flex-col gap-2 rounded-[var(--radius-card)] border border-neutral-200 bg-white p-4 hover:border-brand-100"
    >
      <span className="flex items-center gap-2">
        <span aria-hidden="true" className={`inline-flex min-w-9 justify-center rounded-md px-1.5 py-1 text-[11px] font-bold ${getHub(listing.hub).accent}`}>
          {listing.icon}
        </span>
        <span className="text-xs text-neutral-600">{hubName}</span>
      </span>
      <span className="text-base font-semibold text-neutral-900 group-hover:text-brand-700">{listing.name}</span>
      <span className="text-sm leading-6 text-neutral-600">{listing.description}</span>
      <span className="mt-auto pt-1 text-xs font-medium text-neutral-600">{PROCESSING_LABEL[processing]}</span>
    </Link>
  );
}

export function RecommendedTools({ ids, title, headingId }: { ids: string[]; title: string; headingId: string }) {
  const tools = blogTools(ids);
  if (!tools.length) return null;
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <h2 id={headingId} className="text-xl font-semibold text-neutral-900">
        {title}
      </h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tools.map((t) => (
          <li key={t.listing.id}>
            <RecommendedToolCard id={t.listing.id} />
          </li>
        ))}
      </ul>
    </section>
  );
}
