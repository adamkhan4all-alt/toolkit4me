import type { ArticleSummary } from "../../data/blog/meta";
import { ArticleCard } from "./ArticleCard";

export function RelatedArticles({ articles, title = "Related articles" }: { articles: ArticleSummary[]; title?: string }) {
  if (!articles.length) return null;
  return (
    <section aria-labelledby="related-articles-heading" className="flex flex-col gap-4">
      <h2 id="related-articles-heading" className="text-xl font-semibold text-neutral-900">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </section>
  );
}
