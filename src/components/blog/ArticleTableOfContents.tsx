import type { TocEntry } from "../../data/blog/meta";

/**
 * Plain anchor-link list (no JavaScript). `variant="sidebar"` is the sticky desktop column; the default is the
 * collapsible box shown above the article on smaller screens.
 */
export function ArticleTableOfContents({ entries, variant = "inline" }: { entries: TocEntry[]; variant?: "inline" | "sidebar" }) {
  const list = (
    <ol className="ml-5 flex list-decimal flex-col gap-1.5 text-sm leading-6 marker:text-neutral-400">
      {entries.map((e) => (
        <li key={e.id}>
          <a href={`#${e.id}`} className="focus-ring rounded text-neutral-700 hover:text-brand-700 hover:underline">
            {e.label}
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === "sidebar") {
    return (
      <nav aria-labelledby="toc-sidebar-heading" className="flex flex-col gap-3">
        <h2 id="toc-sidebar-heading" className="text-xs font-semibold tracking-wide text-neutral-600 uppercase">
          In this article
        </h2>
        {list}
      </nav>
    );
  }
  return (
    <nav aria-labelledby="toc-heading" className="rounded-[var(--radius-card)] border border-neutral-200 bg-white">
      <details open className="group p-4">
        <summary className="focus-ring flex cursor-pointer list-none items-center justify-between rounded text-sm font-semibold text-neutral-900">
          <h2 id="toc-heading">In this article</h2>
          <span aria-hidden="true" className="text-neutral-400 transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <div className="pt-3">{list}</div>
      </details>
    </nav>
  );
}
