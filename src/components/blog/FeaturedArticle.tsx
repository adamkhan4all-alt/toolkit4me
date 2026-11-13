import { Link } from "react-router-dom";
import { getBlogAuthor } from "../../data/blog/authors";
import type { ArticleSummary } from "../../data/blog/meta";
import { formatLongDate } from "../../lib/format";
import { ArticleCategoryBadge } from "./ArticleCategoryBadge";

/** The large featured story at the top of /blog. Its image is the page's largest element, so it loads eagerly. */
export function FeaturedArticle({ article }: { article: ArticleSummary }) {
  const author = getBlogAuthor(article.author);
  return (
    <section aria-labelledby="featured-article-heading" className="overflow-hidden rounded-[var(--radius-card)] border border-neutral-200 bg-white shadow-[var(--shadow-card)]">
      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr]">
        <img
          src={article.hero.src}
          alt={article.hero.alt}
          width={article.hero.width}
          height={article.hero.height}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="aspect-[40/21] h-auto w-full self-center object-cover"
        />
        <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-wide text-neutral-600 uppercase">Featured article</p>
          <ArticleCategoryBadge category={article.category} />
          <h2 id="featured-article-heading" className="text-2xl leading-tight font-bold text-neutral-900 sm:text-[28px]">
            <Link to={article.path} className="focus-ring rounded hover:text-brand-700">
              {article.title}
            </Link>
          </h2>
          <p className="text-[15px] leading-7 text-neutral-700">{article.excerpt}</p>
          <p className="text-xs text-neutral-600">
            By {author.name} · <time dateTime={article.published}>{formatLongDate(article.published)}</time> · {article.readingMinutes} min read
          </p>
          <Link
            to={article.path}
            className="focus-ring mt-1 inline-flex min-h-11 w-fit items-center justify-center rounded-[var(--radius-control)] bg-brand-600 px-5 text-[15px] font-medium text-white hover:bg-brand-700"
          >
            Read article<span className="sr-only">: {article.title}</span>
            <span aria-hidden="true">&nbsp;→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
