import { Link } from "react-router-dom";
import { getBlogAuthor } from "../../data/blog/authors";
import { formatLongDate } from "../../lib/format";

/** Byline row under the H1: author, publication date, last updated date and reading time. */
export function ArticleByline({ authorId, published, updated, minutes }: { authorId: string; published: string; updated: string; minutes: number }) {
  const author = getBlogAuthor(authorId);
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-600">
      <span>
        By{" "}
        <Link to={author.profilePath} className="focus-ring rounded font-semibold text-neutral-800 hover:text-brand-700 hover:underline">
          {author.name}
        </Link>
      </span>
      <span aria-hidden="true">·</span>
      <span>
        Published <time dateTime={published}>{formatLongDate(published)}</time>
      </span>
      <span aria-hidden="true">·</span>
      <span>
        Last updated <time dateTime={updated}>{formatLongDate(updated)}</time>
      </span>
      <span aria-hidden="true">·</span>
      <span>{minutes} min read</span>
    </p>
  );
}

/** "About the author" box at the end of an article, with how to report a mistake. */
export function ArticleAuthor({ authorId }: { authorId: string }) {
  const author = getBlogAuthor(authorId);
  return (
    <section aria-labelledby="about-author-heading" className="flex gap-4 rounded-[var(--radius-card)] border border-neutral-200 bg-white p-5">
      <span aria-hidden="true" className="brand-gradient-bg inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black text-white">
        T4
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 id="about-author-heading" className="text-base font-semibold text-neutral-900">
          About the author: {author.name}
        </h2>
        <p className="text-sm leading-6 text-neutral-600">{author.bio}</p>
        <p className="text-sm leading-6 text-neutral-600">
          Read how articles are researched and checked in our{" "}
          <Link to="/editorial-policy" className="focus-ring rounded font-medium text-brand-700 underline">
            Editorial Policy
          </Link>
          . Spotted a mistake? Email{" "}
          <a href="mailto:toolkit4me@gmail.com" className="focus-ring rounded font-medium text-brand-700 underline">
            toolkit4me@gmail.com
          </a>
          .
        </p>
      </div>
    </section>
  );
}
