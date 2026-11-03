// ---------------------------------------------------------------------
// Registry of the indexable, non-tool, non-guide public pages, with the
// date each one's content last changed. scripts/generate-seo-files.ts
// builds sitemap-pages.xml from this, and src/__tests__/routing.test.tsx
// asserts every path here actually renders — so a page can't be listed
// in the sitemap without a real route behind it.
//
// Tool pages come from src/data/tools.ts and guides from
// src/data/guides.ts; never list those here.
//
// Deliberately excluded: /404 (noindex), and /tools?category=… filter
// views (they canonicalize to /tools).
// ---------------------------------------------------------------------

import { TOOL_DEFINITIONS } from "../../data/tools";
import { GUIDES } from "../../data/guides";

export interface StaticPage {
  path: string;
  /** ISO date (YYYY-MM-DD) of the last meaningful change to the page's own content. */
  lastModified: string;
}

/** Latest of a set of ISO dates (string comparison is safe for YYYY-MM-DD). */
export function latestDate(...dates: string[]): string {
  return dates.reduce((a, b) => (b > a ? b : a));
}

const toolsUpdated = latestDate(...TOOL_DEFINITIONS.map((t) => t.lastModified));
const guidesUpdated = latestDate(...GUIDES.map((g) => g.updated));

export const STATIC_PAGES: StaticPage[] = [
  // Home and the two index pages list tools/guides, so they change whenever those do.
  { path: "/", lastModified: latestDate("2026-10-26", toolsUpdated, guidesUpdated) },
  { path: "/tools", lastModified: latestDate("2026-09-10", toolsUpdated) },
  { path: "/guides", lastModified: latestDate("2026-10-26", guidesUpdated) },
  { path: "/about", lastModified: "2026-11-03" },
  { path: "/contact", lastModified: "2026-10-06" },
  { path: "/privacy", lastModified: "2026-11-03" },
  { path: "/terms", lastModified: "2026-10-06" },
  { path: "/disclaimer", lastModified: "2026-11-03" },
  { path: "/editorial-policy", lastModified: "2026-11-03" },
];
