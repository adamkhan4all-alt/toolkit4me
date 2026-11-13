import { Link } from "react-router-dom";
import { blogCategoryPath, getBlogCategory } from "../../data/blog/categories";
import type { BlogCategoryId } from "../../data/blog/types";

/** Category label; a link to the category page unless `asLink` is false (e.g. inside a card that is itself a link). */
export function ArticleCategoryBadge({ category, asLink = true }: { category: BlogCategoryId; asLink?: boolean }) {
  const c = getBlogCategory(category);
  if (!c) return null;
  const className = `inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ${c.badge}`;
  return asLink ? (
    <Link to={blogCategoryPath(c.id)} className={`focus-ring ${className} hover:underline`}>
      {c.label}
    </Link>
  ) : (
    <span className={className}>{c.label}</span>
  );
}
