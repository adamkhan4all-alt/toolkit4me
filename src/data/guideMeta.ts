// ---------------------------------------------------------------------
// Guide types, categories and small helpers — kept apart from the guide
// content (src/data/guides.ts) so code that only needs these (structured
// data, tool pages) doesn't pull every guide's text into the shared bundle.
// ---------------------------------------------------------------------

export interface GuideTable {
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface GuideImage {
  /** Path under /public, e.g. "/images/guides/compress-pdf-levels.webp". */
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

export interface GuideSection {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
  table?: GuideTable;
  image?: GuideImage;
}

export type GuideCategory = "pdf" | "images" | "ocr" | "web" | "writing";

/** Display names for guide categories, in the order the blog lists them. */
export const GUIDE_CATEGORIES: { id: GuideCategory; label: string; description: string }[] = [
  { id: "pdf", label: "PDF & documents", description: "Compressing, converting, merging and protecting PDFs and Office files." },
  { id: "images", label: "Images", description: "Image formats, compression, resizing and conversion." },
  { id: "ocr", label: "OCR", description: "Turning photos and scans into editable text." },
  { id: "web", label: "QR codes & web", description: "QR codes, JSON, Base64 and meta tags." },
  { id: "writing", label: "Writing & text", description: "Word counts, character limits and comparing text." },
];

/** Title/description of the /guides index — shared by GuidesIndexPage and scripts/prerender.ts. */
export const GUIDES_INDEX_META = {
  title: "Guides — PDF, Image, QR Code & Text How-Tos | Toolkit4Me",
  description:
    "Practical, plain-English guides to everyday file and text tasks: shrinking PDFs, choosing image formats, OCR, QR codes, JSON, meta tags and word limits.",
};

/** Shown as the byline on every guide; see the Editorial Policy page for how guides are written and reviewed. */
export const GUIDE_AUTHOR = "Toolkit4Me Editorial Team";

export interface GuideDefinition {
  /** Route path, e.g. "/guides/how-to-reduce-pdf-file-size". */
  path: string;
  /** Visible H1. */
  title: string;
  seoTitle: string;
  metaDescription: string;
  /** Lead paragraph under the H1; also the card text on the guides index. */
  summary: string;
  /** ISO date (YYYY-MM-DD) first published — Article structured data. */
  published: string;
  /** ISO date (YYYY-MM-DD) of the last meaningful content change — shown as "Last updated", and used for the sitemap <lastmod> and Article dateModified. */
  updated: string;
  category: GuideCategory;
  /** Search intent this guide targets — used for editorial planning and the SEO tracker, never emitted as a meta keywords tag. */
  keywords: { primary: string; secondary: string[] };
  /** Shown in the "Featured" row of the blog index. */
  featured?: boolean;
  sections: GuideSection[];
  /** Reader questions answered at the end of the guide (visible content; no FAQPage markup for guides). */
  faq?: { question: string; answer: string }[];
  /** Tool slugs linked at the end of the guide; the first is the guide's main call to action. */
  relatedTools?: string[];
}

/** Words in a guide's visible text (summary, sections, tables, FAQs). */
export function guideWordCount(guide: GuideDefinition): number {
  const text = [
    guide.summary,
    ...guide.sections.flatMap((s) => [s.heading ?? "", ...(s.paragraphs ?? []), ...(s.list ?? []), ...(s.table ? [...s.table.headers, ...s.table.rows.flat()] : [])]),
    ...(guide.faq ?? []).flatMap((f) => [f.question, f.answer]),
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

/** Estimated reading time in whole minutes, at 238 words per minute (average adult non-fiction reading speed). */
export function readingMinutes(guide: GuideDefinition): number {
  return Math.max(1, Math.round(guideWordCount(guide) / 238));
}

/** Stable anchor id for a section heading, used by the table of contents. */
export function sectionId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function guideCategoryLabel(id: GuideCategory): string {
  return GUIDE_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
