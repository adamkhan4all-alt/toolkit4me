import { Link } from "react-router-dom";
import { BLOG_CATEGORIES, blogCategoryPath } from "../../data/blog/categories";
import { articlesInCategory, type ArticleSummary } from "../../data/blog/meta";
import type { BlogCategoryId } from "../../data/blog/types";

/** Category chips with article counts. The current category (if any) is marked with aria-current. */
export function BlogCategoryNav({ index, active }: { index: ArticleSummary[]; active?: BlogCategoryId }) {
  return (
    <nav aria-label="Blog categories">
      <ul className="flex flex-wrap gap-2">
        {BLOG_CATEGORIES.map((c) => {
          const count = articlesInCategory(index, c.id).length;
          const isActive = c.id === active;
          return (
            <li key={c.id}>
              <Link
                to={blogCategoryPath(c.id)}
                aria-current={isActive ? "page" : undefined}
                className={`focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors ${
                  isActive ? "border-brand-600 bg-brand-600 text-white" : "border-neutral-200 bg-white text-neutral-700 hover:border-brand-600 hover:text-brand-700"
                }`}
              >
                {c.label}
                <span className={isActive ? "text-brand-100" : "text-neutral-500"}>({count})</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
