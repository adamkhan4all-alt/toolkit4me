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
// ---------------------------------------------------------------------

// Optional chaining on `import.meta.env` because this module is also
// imported directly by the plain-Node prerender/sitemap scripts (via tsx),
// where Vite's env injection isn't present.
export const SITE_URL = (import.meta.env?.VITE_SITE_URL ?? "https://toolkit4me.com").replace(/\/$/, "");
export const SITE_NAME = "Toolkit4Me";
export const TAGLINE = "Free tools for everyday digital tasks.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;
export const TWITTER_HANDLE = "@toolkit4me";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
