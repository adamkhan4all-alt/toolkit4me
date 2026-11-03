// ---------------------------------------------------------------------
// Sitemap architecture: a sitemap index at /sitemap.xml pointing at one
// child sitemap per content type. Every URL comes from the real data the
// app routes from (STATIC_PAGES, TOOL_DEFINITIONS, GUIDES), so a new tool
// or guide lands in its sitemap automatically on the next build.
//
// Pure functions only — scripts/generate-seo-files.ts writes the output
// into public/ (Vercel then serves each file at its own URL with a 200),
// and the unit tests call these directly.
// ---------------------------------------------------------------------

import { SITE_URL } from "../../config/site";
import { TOOL_DEFINITIONS } from "../../data/tools";
import { GUIDES } from "../../data/guides";
import { STATIC_PAGES, latestDate } from "./pages";

export interface SitemapEntry {
  path: string;
  /** ISO date (YYYY-MM-DD). */
  lastModified: string;
}

export interface SitemapFile {
  /** Published file name, e.g. "sitemap-tools.xml". */
  fileName: string;
  entries: SitemapEntry[];
}

/** Google's per-file limit; larger groups are split into -2, -3, … files. */
export const MAX_URLS_PER_SITEMAP = 50_000;

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

/** Absolute canonical URL for a route: preferred host, no query/hash, no trailing slash (except the root). */
export function canonicalUrl(path: string): string {
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, "");
  return `${SITE_URL}${clean.startsWith("/") ? clean : `/${clean}`}`;
}

/** The content groups, in the order they appear in the index. Add a group here to add a child sitemap. */
export function sitemapGroups(): { name: string; entries: SitemapEntry[] }[] {
  return [
    { name: "pages", entries: STATIC_PAGES.map((p) => ({ path: p.path, lastModified: p.lastModified })) },
    { name: "tools", entries: TOOL_DEFINITIONS.map((t) => ({ path: `/tools/${t.slug}`, lastModified: t.lastModified })) },
    { name: "guides", entries: GUIDES.map((g) => ({ path: g.path, lastModified: g.updated })) },
  ];
}

/** Splits each group into files of at most MAX_URLS_PER_SITEMAP URLs and drops duplicate URLs. */
export function buildSitemapFiles(groups = sitemapGroups(), maxPerFile = MAX_URLS_PER_SITEMAP): SitemapFile[] {
  const seen = new Set<string>();
  const files: SitemapFile[] = [];
  for (const group of groups) {
    const unique = group.entries.filter((e) => {
      const url = canonicalUrl(e.path);
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
    for (let i = 0; i < Math.max(unique.length, 1); i += maxPerFile) {
      const part = i / maxPerFile;
      files.push({
        fileName: part === 0 ? `sitemap-${group.name}.xml` : `sitemap-${group.name}-${part + 1}.xml`,
        entries: unique.slice(i, i + maxPerFile),
      });
    }
  }
  return files;
}

export function renderUrlset(entries: SitemapEntry[]): string {
  const urls = entries
    .map((e) => `  <url>\n    <loc>${escapeXml(canonicalUrl(e.path))}</loc>\n    <lastmod>${e.lastModified}</lastmod>\n  </url>`)
    .join("\n");
  return `${XML_HEADER}\n<urlset xmlns="${SITEMAP_NS}">\n${urls}\n</urlset>\n`;
}

export function renderSitemapIndex(files: SitemapFile[]): string {
  const sitemaps = files
    .map((f) => {
      const lastmod = f.entries.length ? `\n    <lastmod>${latestDate(...f.entries.map((e) => e.lastModified))}</lastmod>` : "";
      return `  <sitemap>\n    <loc>${escapeXml(`${SITE_URL}/${f.fileName}`)}</loc>${lastmod}\n  </sitemap>`;
    })
    .join("\n");
  return `${XML_HEADER}\n<sitemapindex xmlns="${SITEMAP_NS}">\n${sitemaps}\n</sitemapindex>\n`;
}
