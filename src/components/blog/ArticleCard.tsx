import { Link } from "react-router-dom";
import type { ArticleSummary } from "../../data/blog/meta";
import { formatLongDate } from "../../lib/format";
import { ArticleCategoryBadge } from "./ArticleCategoryBadge";

/** Card for article grids. The image is decorative here (the title carries the meaning), so its alt is empty. */
export function ArticleCard({ article, headingLevel = 3 }: { article: ArticleSummary; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="card-lift group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-neutral-200 bg-white">
      <img
        src={article.hero.src}
        alt=""
        width={article.hero.width}
        height={article.hero.height}
        loading="lazy"
        decoding="async"
        className="aspect-[40/21] h-auto w-full border-b border-neutral-200 object-cover"
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <ArticleCategoryBadge category={article.category} asLink={false} />
        <Heading className="text-lg leading-snug font-semibold text-neutral-900 group-hover:text-brand-700">
          {/* The stretched link makes the whole card clickable while keeping one link per card. */}
          <Link to={article.path} className="focus-ring rounded after:absolute after:inset-0 after:content-['']">
            {article.title}
          </Link>
        </Heading>
        <p className="text-sm leading-6 text-neutral-600">{article.excerpt}</p>
        <p className="mt-auto pt-2 text-xs text-neutral-600">
          <time dateTime={article.published}>{formatLongDate(article.published)}</time> · {article.readingMinutes} min read
        </p>
      </div>
    </article>
  );
}
