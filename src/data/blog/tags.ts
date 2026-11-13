/** Display names for article tags. Every tag an article uses must be listed here (enforced by the content tests). */
export const TAG_LABELS: Record<string, string> = {
  pdf: "PDF",
  images: "Images",
  ocr: "OCR",
  "office-documents": "Office documents",
  "file-sharing": "File sharing",
  privacy: "Privacy",
  metadata: "Metadata",
  students: "Students",
  teachers: "Teachers",
  freelancers: "Freelancers",
  "small-business": "Small business",
  marketing: "Marketing",
  calculators: "Calculators",
  productivity: "Productivity",
  "browser-tools": "Browser-based tools",
  "remote-work": "Remote work",
};

export function tagLabel(tag: string): string {
  return TAG_LABELS[tag] ?? tag;
}

export function tagPath(tag: string): string {
  return `/blog/tag/${tag}`;
}

/** Title, description and H1 of a tag page — shared by BlogTagPage and scripts/prerender.ts. */
export function tagPageMeta(tag: string, count: number) {
  const label = tagLabel(tag);
  return {
    title: `${label} Articles | Toolkit4Me Blog`,
    description: `${count} Toolkit4Me blog article${count === 1 ? "" : "s"} tagged “${label}”: practical help with documents, images, privacy and productivity using free online tools.`,
    h1: `Articles tagged “${label}”`,
  };
}

/**
 * A tag page is only worth indexing once it gathers several articles; until then it stays reachable for readers
 * but carries noindex and is left out of the sitemap, so search engines don't see near-empty pages.
 */
export const MIN_ARTICLES_FOR_INDEXED_TAG = 2;
