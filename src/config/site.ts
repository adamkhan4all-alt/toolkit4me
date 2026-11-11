// ---------------------------------------------------------------------
// Single source of truth for site-wide SEO constants — the canonical
// domain, default social image, and site name. Every piece of the SEO
// layer (per-page <SeoHead>, sitemap.xml/robots.txt generation, the
// prerender script) reads from here instead of hardcoding the domain in
// multiple places.
//
// VITE_SITE_URL lets a real deployment override the default domain at
// build time without touching code (e.g. VITE_SITE_URL=https://
// toolkit4me.com npm run build). No trailing slash.
//
// IMPORTANT: scripts/generate-seo-files.ts and scripts/prerender.ts import
// SITE_URL directly and run via tsx (plain Node), where import.meta.env is
// undefined — so VITE_SITE_URL in .env.production is NOT seen by them and
// the fallback below is what actually ends up in sitemap.xml, robots.txt,
// canonical tags, and JSON-LD for every real build. Keep this in sync with
// .env.production's VITE_SITE_URL (and with which of apex/www Vercel is
// configured to treat as primary/non-redirecting) or those outputs will
// silently point at the wrong host again.
// ---------------------------------------------------------------------

// Optional chaining on `import.meta.env` because this module is also
// imported directly by the plain-Node prerender/sitemap scripts (via tsx),
// where Vite's env injection isn't present.
export const SITE_URL = (import.meta.env?.VITE_SITE_URL ?? "https://www.toolkit4me.com").replace(/\/$/, "");
export const SITE_NAME = "Toolkit4Me";
export const TAGLINE = "Free tools for everyday digital tasks.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;
export const DEFAULT_OG_IMAGE_ALT = "Toolkit4Me — free tools for everyday digital tasks: PDF, image, OCR, text, JSON and QR code tools";
export const TWITTER_HANDLE = "@toolkit4me";
/** Homepage meta description — shared by HomePage and scripts/prerender.ts so the static and client-rendered <head> match. */
export const HOME_DESCRIPTION =
  "Free online tools for PDFs, images, text and web work: convert and compress files, edit PDFs, count words, compare text, format JSON and make QR codes.";
/** All Tools page copy — shared by ToolsDirectoryPage and scripts/prerender.ts. The intro takes the live tool count so it never goes stale. */
export const TOOLS_PAGE_TITLE = "All Tools – PDF, Image, Text & Developer Tools | Toolkit4Me";
export const TOOLS_PAGE_DESCRIPTION =
  "Browse every free tool on Toolkit4Me: convert, compress, merge and edit PDFs and images, extract text with OCR, and use text and developer utilities.";
export function toolsPageIntro(count: number): string {
  return `Browse all ${count} free tools — PDF and document conversion, image editing and compression, OCR, PDF security, text utilities like word counting and text comparison, and developer tools for JSON, Base64, meta tags and QR codes. Filter by category or search for the tool you need.`;
}
/** Public support inbox — used in Organization structured data. */
export const CONTACT_EMAIL = "toolkit4me@gmail.com";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
