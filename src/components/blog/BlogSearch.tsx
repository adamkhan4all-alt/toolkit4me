import { useId } from "react";
import { searchArticles, type ArticleSummary } from "../../data/blog/meta";
import { ArticleCard } from "./ArticleCard";

/** Search box for the blog home. Searches the small listing index in the browser — no request is sent anywhere. */
export function BlogSearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <form role="search" aria-label="Search articles" onSubmit={(e) => e.preventDefault()} className="w-full max-w-xl">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-800">
        Search articles
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. PDF, students, privacy"
          autoComplete="off"
          className="focus-ring min-h-11 w-full rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 text-[15px] text-neutral-900 placeholder:text-neutral-500"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="focus-ring min-h-11 shrink-0 rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-700 hover:border-brand-600"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}

export function BlogSearchResults({ index, query }: { index: ArticleSummary[]; query: string }) {
  const results = searchArticles(index, query);
  return (
    <section aria-labelledby="search-results-heading" className="flex flex-col gap-4">
      <h2 id="search-results-heading" className="text-xl font-semibold text-neutral-900">
        Search results
      </h2>
      <p aria-live="polite" className="text-sm text-neutral-600">
        {results.length === 0
          ? `No articles match “${query.trim()}”. Try a broader word such as “PDF”, “images” or “privacy”, or browse the categories below.`
          : `${results.length} article${results.length === 1 ? "" : "s"} match “${query.trim()}”.`}
      </p>
      {results.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      )}
    </section>
  );
}
