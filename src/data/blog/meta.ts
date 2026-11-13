// ---------------------------------------------------------------------
// Light helpers shared by the blog listing pages, the article page, the
// prerender script and the generated index. Nothing here imports article
// text, so listing pages stay small.
// ---------------------------------------------------------------------

import { plainText } from "../../lib/blog/inline";
import { blogCategoryLabel, blogCategoryPath } from "./categories";
import { tagLabel } from "./tags";
import type { ArticleFigure, BlogArticle, BlogCategoryId } from "./types";

/** What listing pages (cards, search, category and tag pages) need about an article. */
export interface ArticleSummary {
  slug: string;
  path: string;
  title: string;
  excerpt: string;
  category: BlogCategoryId;
  tags: string[];
  author: string;
  published: string;
  updated: string;
  readingMinutes: number;
  featured: boolean;
  editorsPick: boolean;
  hero: ArticleFigure;
  relatedArticles: string[];
}

export const BLOG_PATH = "/blog";

export function articlePath(slug: string): string {
  return `${BLOG_PATH}/${slug}`;
}

/** Home › Blog › Category › Article — shared by ArticlePage and scripts/prerender.ts. */
export function articleBreadcrumbs(article: Pick<BlogArticle, "slug" | "title" | "category">) {
  return [
    { name: "Home", path: "/" },
    { name: "Blog", path: BLOG_PATH },
    { name: blogCategoryLabel(article.category), path: blogCategoryPath(article.category) },
    { name: article.title, path: articlePath(article.slug) },
  ];
}

/** Title and description of /blog — shared by BlogHomePage and scripts/prerender.ts. */
export const BLOG_INDEX_META = {
  title: "Toolkit4Me Blog — Practical Articles on Documents, Images, Privacy & Productivity",
  description:
    "Practical articles for students, freelancers, small businesses and professionals: getting everyday document, image, privacy and productivity tasks done with free tools.",
  h1: "Blog & Resource Center",
  intro:
    "Practical articles for students, teachers, freelancers, small businesses and anyone who works with documents and images. Each one starts from a real task, explains the choices involved, and links to the free tools and step-by-step guides that help.",
};

/** Cards shown before "Load more" on the blog home, category and tag pages. */
export const ARTICLES_PER_PAGE = 9;

/** Every piece of visible text in an article, for word counts. */
function articleText(a: BlogArticle): string[] {
  return [
    a.excerpt,
    ...a.takeaways,
    ...a.intro,
    ...a.sections.flatMap((s) => [
      s.heading,
      ...(s.paragraphs ?? []),
      ...(s.list ?? []),
      ...(s.steps ?? []),
      ...(s.table ? [...s.table.headers, ...s.table.rows.flat()] : []),
      ...(s.callout ? [s.callout.title, ...s.callout.body] : []),
      ...(s.subsections ?? []).flatMap((sub) => [sub.heading, ...(sub.paragraphs ?? []), ...(sub.list ?? []), ...(sub.steps ?? [])]),
    ]),
    ...(a.faq ?? []).flatMap((f) => [f.question, f.answer]),
  ];
}

export function articleWordCount(a: BlogArticle): number {
  return articleText(a)
    .map(plainText)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Whole minutes at 238 words per minute (average adult non-fiction reading speed) — the same rate guides use. */
export function articleReadingMinutes(a: BlogArticle): number {
  return Math.max(1, Math.round(articleWordCount(a) / 238));
}

export function toSummary(a: BlogArticle): ArticleSummary {
  return {
    slug: a.slug,
    path: articlePath(a.slug),
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    tags: a.tags,
    author: a.author,
    published: a.published,
    updated: a.updated,
    readingMinutes: articleReadingMinutes(a),
    featured: Boolean(a.featured),
    editorsPick: Boolean(a.editorsPick),
    hero: a.hero,
    relatedArticles: a.relatedArticles ?? [],
  };
}

/** Newest first; ties broken by last update, then title, so the order is stable. */
export function byNewest(a: { published: string; updated: string; title: string }, b: { published: string; updated: string; title: string }): number {
  return b.published.localeCompare(a.published) || b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title);
}

/** The featured story: the newest article marked featured, else the newest article. */
export function featuredArticle(index: ArticleSummary[]): ArticleSummary | undefined {
  const sorted = [...index].sort(byNewest);
  return sorted.find((a) => a.featured) ?? sorted[0];
}

/** Stable anchor id for a heading, used by the table of contents. */
export function headingId(heading: string): string {
  return plainText(heading)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface TocEntry {
  id: string;
  label: string;
}

/** Table-of-contents entries for an article: every H2, then the FAQ and references when present. */
export function tocEntries(sections: { heading: string }[], extras: { faq: boolean; references: boolean }): TocEntry[] {
  return [
    ...sections.map((s) => ({ id: headingId(s.heading), label: plainText(s.heading) })),
    ...(extras.faq ? [{ id: "article-faq", label: "Frequently asked questions" }] : []),
    ...(extras.references ? [{ id: "article-references", label: "References and sources" }] : []),
  ];
}

/**
 * Related articles: the article's own picks first, then the same category, then the most shared tags,
 * then newest. Never includes the article itself.
 */
export function relatedArticlesFor(article: { slug: string; category: BlogCategoryId; tags: string[]; relatedArticles?: string[] }, index: ArticleSummary[], limit = 3): ArticleSummary[] {
  const picks = (article.relatedArticles ?? []).map((s) => index.find((a) => a.slug === s)).filter((a): a is ArticleSummary => a !== undefined && a.slug !== article.slug);
  const tags = new Set(article.tags);
  const rest = index
    .filter((a) => a.slug !== article.slug && !picks.includes(a))
    .map((a) => ({ a, score: (a.category === article.category ? 10 : 0) + a.tags.filter((t) => tags.has(t)).length }))
    .sort((x, y) => y.score - x.score || byNewest(x.a, y.a))
    .map(({ a }) => a);
  return [...picks, ...rest].slice(0, limit);
}

/** Articles carrying a tag, newest first. */
export function articlesWithTag(index: ArticleSummary[], tag: string): ArticleSummary[] {
  return index.filter((a) => a.tags.includes(tag)).sort(byNewest);
}

export function articlesInCategory(index: ArticleSummary[], category: BlogCategoryId): ArticleSummary[] {
  return index.filter((a) => a.category === category).sort(byNewest);
}

/** Every tag used by at least one article, with its article count, most used first. */
export function tagCounts(index: ArticleSummary[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const a of index) for (const t of a.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/**
 * Search over titles, excerpts, category names and tags. Every word in the query must match somewhere,
 * and title matches rank first.
 */
export function searchArticles(index: ArticleSummary[], query: string): ArticleSummary[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return index
    .map((a) => {
      const title = a.title.toLowerCase();
      const haystack = [title, a.excerpt.toLowerCase(), blogCategoryLabel(a.category).toLowerCase(), ...a.tags.map((t) => tagLabel(t).toLowerCase())].join(" ");
      if (!words.every((w) => haystack.includes(w))) return null;
      return { a, score: words.filter((w) => title.includes(w)).length };
    })
    .filter((x): x is { a: ArticleSummary; score: number } => x !== null)
    .sort((x, y) => y.score - x.score || byNewest(x.a, y.a))
    .map(({ a }) => a);
}
