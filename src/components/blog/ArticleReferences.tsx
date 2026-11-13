import type { ArticleReference } from "../../data/blog/types";

/** Numbered sources. External, so each opens in a new tab with rel="noopener noreferrer". */
export function ArticleReferences({ references }: { references: ArticleReference[] }) {
  if (!references.length) return null;
  return (
    <section id="article-references" aria-labelledby="article-references-heading" className="flex scroll-mt-24 flex-col gap-3">
      <h2 id="article-references-heading" className="text-xl font-semibold text-neutral-900">
        References and sources
      </h2>
      <ol className="ml-5 flex list-decimal flex-col gap-2.5 text-sm leading-6 text-neutral-600">
        {references.map((r) => (
          <li key={r.url}>
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="focus-ring rounded font-medium text-brand-700 underline">
              {r.title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>{" "}
            — {r.publisher}
            {r.note ? <span className="block text-xs text-neutral-600">{r.note}</span> : null}
          </li>
        ))}
      </ol>
      <p className="text-xs text-neutral-600">External sites have their own content and privacy practices; we link to them because they support what this article says.</p>
    </section>
  );
}
