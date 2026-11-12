# SEO Baseline

Recorded 2026-11-12 from the production build and the live site.

## Indexing setup

| Item | State |
|---|---|
| Canonical host | `https://www.toolkit4me.com` (apex 308-redirects to www) |
| robots.txt | `Allow: /` for all agents, `Sitemap: https://www.toolkit4me.com/sitemap.xml` |
| Sitemap | Index `sitemap.xml` → `sitemap-pages.xml` (9), `sitemap-tools.xml` (26), `sitemap-guides.xml` (41) = 76 URLs |
| Sitemap generation | `scripts/generate-seo-files.ts` from the registry, guides and `STATIC_PAGES`; `<lastmod>` from each item's own date |
| Sitemap health | All 76 URLs return 200, unique, absolute HTTPS on the canonical host (checked by the final validation sweep) |
| Search Console | The reported 404 came from submitting `https://toolkit4me.com/sitemap-guides.xml` (non-www). Submit `https://www.toolkit4me.com/sitemap.xml` only |
| noindex | Only the 404 page |

## On-page

Enforced by `audit-dist.mjs` on every build: exactly one `<title>`, one meta description, one canonical (none on noindex pages), the AdSense tag once per page, unique titles and descriptions across the site, every sitemap URL prerendered.

| Page type | Structured data |
|---|---|
| Home | WebSite, Organization (+ ContactPoint) |
| Tool | WebApplication (free Offer), BreadcrumbList, FAQPage (visible FAQ) |
| Guide | BlogPosting, BreadcrumbList |
| Guides index, legal, about | BreadcrumbList |

## Content

- 26 tool pages, each with unique intro, steps, use cases, limitations, FAQ, related tools and linked guides.
- 41 guides (450–820 words), each with a distinct primary keyword (`docs/seo-tracker.csv`).
- Keyword roadmap and QR cluster plan: `docs/SEO_CONTENT_ROADMAP.md`.

## Gaps to address in this programme

1. No hub/category landing pages beyond `/tools` with a query filter — the `?category=` URLs used in breadcrumbs aren't separate indexable pages. Release 1 adds real hub pages (`/pdf-tools`, `/image-tools`, `/developer-tools`), included in the sitemap.
2. Sitemap split by hub (brief §11.4) once hubs exist.
3. An automated sitemap validation command in the repository (currently a script outside it).
4. No measured field data available here (no Search Console access); the owner should export it for `npm run seo:tracker`.
