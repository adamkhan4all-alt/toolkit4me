// ---------------------------------------------------------------------
// Blog & Resource Center content model.
//
// Articles are typed data files (src/data/blog/articles/<slug>.ts), like
// the guides and tools: the React pages render them, scripts/prerender.ts
// writes the same objects to static HTML, and the sitemap is built from
// them, so the three can never drift apart. No CMS, no database.
//
// Text fields accept two pieces of inline markup, parsed by
// src/lib/blog/inline.ts (and validated by src/data/blog/__tests__):
//   [link text](/internal/path)   or   [link text](https://external.example)
//   **bold text**
// ---------------------------------------------------------------------

export type BlogCategoryId =
  | "business-productivity"
  | "education-learning"
  | "career-development"
  | "freelancers-small-business"
  | "technology-ai"
  | "digital-tools-tutorials"
  | "security-privacy";

export interface BlogCategory {
  id: BlogCategoryId;
  label: string;
  /** One or two sentences shown on the category page and the category nav. */
  description: string;
  seoTitle: string;
  metaDescription: string;
  /** Tailwind classes for the category badge — every pair passes WCAG AA (4.5:1). */
  badge: string;
  /** Guide paths that suit this category, listed on its page (useful even before it has articles). */
  relatedGuides: string[];
}

/**
 * What a figure shows. Illustrations and diagrams are drawn by the editorial team and labelled as such;
 * screenshots and results come from running the real tool, never mocked up.
 */
export type FigureKind = "illustration" | "diagram" | "screenshot" | "result";

export interface ArticleFigure {
  /** Path under /public, e.g. "/images/blog/<slug>/hero.svg". */
  src: string;
  alt: string;
  width: number;
  height: number;
  kind: FigureKind;
  caption?: string;
}

export interface ArticleTable {
  caption: string;
  headers: string[];
  rows: string[][];
}

/** A worked example or tip box inside a section. */
export interface ArticleCallout {
  tone: "example" | "tip" | "warning";
  title: string;
  body: string[];
}

export interface ArticleSubsection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  steps?: string[];
}

export interface ArticleSection {
  /** H2. Every section has one, so every section is in the table of contents. */
  heading: string;
  paragraphs?: string[];
  list?: string[];
  /** Ordered, numbered steps. */
  steps?: string[];
  table?: ArticleTable;
  figure?: ArticleFigure;
  callout?: ArticleCallout;
  /** H3 subsections, rendered after the section's own content. */
  subsections?: ArticleSubsection[];
}

export interface ArticleReference {
  title: string;
  publisher: string;
  url: string;
  /** What the source supports in the article. */
  note?: string;
}

export type ArticleStatus = "draft" | "published";

export interface BlogArticle {
  /** URL segment: /blog/<slug>. Must match the file name in ./articles. */
  slug: string;
  status: ArticleStatus;
  /** Visible H1. */
  title: string;
  seoTitle: string;
  metaDescription: string;
  /** Card text and lead paragraph under the H1. */
  excerpt: string;
  category: BlogCategoryId;
  /** Tag ids (lower-case, hyphenated) — see TAG_LABELS in ./tags.ts. */
  tags: string[];
  /** Author id from ./authors.ts. */
  author: string;
  /** ISO date (YYYY-MM-DD). */
  published: string;
  /** ISO date (YYYY-MM-DD) of the last meaningful content change. */
  updated: string;
  /** Shown as the large featured story on /blog (the newest featured article wins). */
  featured?: boolean;
  /** Listed under "Editor's picks" — an editorial choice, never a popularity claim. */
  editorsPick?: boolean;
  hero: ArticleFigure;
  /** Short answer-first summary shown in a "Key takeaways" box under the intro. */
  takeaways: string[];
  /** Opening paragraphs before the first H2. */
  intro: string[];
  sections: ArticleSection[];
  /** Genuine reader questions answered on the page (emitted as visible content only). */
  faq?: { question: string; answer: string }[];
  /** Ids of real tools or calculators (toolRegistry listings), most relevant first; the first is the main call to action. */
  relatedTools: string[];
  /** Guide paths covering details this article only touches on. */
  relatedGuides?: string[];
  /** Slugs of other articles; the page fills any remaining slots automatically. */
  relatedArticles?: string[];
  references?: ArticleReference[];
}
