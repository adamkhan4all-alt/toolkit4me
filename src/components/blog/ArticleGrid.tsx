import { useState } from "react";
import { ARTICLES_PER_PAGE, type ArticleSummary } from "../../data/blog/meta";
import { ArticleCard } from "./ArticleCard";

/**
 * Card grid with a "Load more" button: renders ARTICLES_PER_PAGE cards at a time, so later cards (and their
 * images) aren't loaded until asked for. The prerendered HTML lists every article as a plain link, so crawlers
 * see them all without a paginated URL scheme.
 */
export function ArticleGrid({ articles, label }: { articles: ArticleSummary[]; label: string }) {
  const [shown, setShown] = useState(ARTICLES_PER_PAGE);
  const visible = articles.slice(0, shown);
  const remaining = articles.length - visible.length;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setShown((n) => n + ARTICLES_PER_PAGE)}
          className="focus-ring mx-auto inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-neutral-300 bg-white px-5 text-sm font-medium text-neutral-800 hover:border-brand-600 hover:text-brand-700"
        >
          Load more {label} ({remaining} more)
        </button>
      )}
      <p className="sr-only" aria-live="polite">
        Showing {visible.length} of {articles.length} {label}.
      </p>
    </div>
  );
}
