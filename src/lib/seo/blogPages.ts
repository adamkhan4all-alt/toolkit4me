// Which blog listing pages exist and which are indexable — shared by the sitemap, the prerender and the tests.
import { BLOG_CATEGORIES, blogCategoryPath } from "../../data/blog/categories";
import { articlesInCategory, articlesWithTag, BLOG_PATH, tagCounts, type ArticleSummary } from "../../data/blog/meta";
import { MIN_ARTICLES_FOR_INDEXED_TAG, tagPath } from "../../data/blog/tags";
import type { BlogCategory } from "../../data/blog/types";

// Local copy of pages.ts's latestDate: this module is used by the browser-side category and tag
// pages, and pages.ts imports every guide's full text.
const latestDate = (...dates: string[]) => dates.reduce((a, b) => (b > a ? b : a));

export interface BlogListingPage {
  path: string;
  /** false → rendered with noindex and left out of the sitemap. */
  indexable: boolean;
  lastModified: string;
}

/** The date blog listing pages' own copy last changed. */
export const BLOG_PAGES_UPDATED = "2026-11-13";

const newest = (articles: ArticleSummary[]) => latestDate(BLOG_PAGES_UPDATED, ...articles.map((a) => a.updated));

/** Every category page; one with no published articles yet is a reader-facing page only (noindex). */
export function blogCategoryPages(index: ArticleSummary[]): (BlogListingPage & { category: BlogCategory; articles: ArticleSummary[] })[] {
  return BLOG_CATEGORIES.map((category) => {
    const articles = articlesInCategory(index, category.id);
    return { category, articles, path: blogCategoryPath(category.id), indexable: articles.length > 0, lastModified: newest(articles) };
  });
}

/** Every tag used by a published article; indexable only once it gathers MIN_ARTICLES_FOR_INDEXED_TAG articles. */
export function blogTagPages(index: ArticleSummary[]): (BlogListingPage & { tag: string; articles: ArticleSummary[] })[] {
  return tagCounts(index).map(({ tag, count }) => {
    const articles = articlesWithTag(index, tag);
    return { tag, articles, path: tagPath(tag), indexable: count >= MIN_ARTICLES_FOR_INDEXED_TAG, lastModified: newest(articles) };
  });
}

/** Indexable blog URLs for sitemap-blog.xml, in a stable order. */
export function blogSitemapEntries(index: ArticleSummary[]): { path: string; lastModified: string }[] {
  return [
    { path: BLOG_PATH, lastModified: newest(index) },
    ...index.map((a) => ({ path: a.path, lastModified: a.updated })),
    ...blogCategoryPages(index).filter((p) => p.indexable),
    ...blogTagPages(index).filter((p) => p.indexable),
  ].map(({ path, lastModified }) => ({ path, lastModified }));
}
