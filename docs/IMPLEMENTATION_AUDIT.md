# Implementation Audit — Release 0

Date: 2026-11-12. Scope: the `toolkit4me-live` frontend repository (deployed to Vercel from GitHub `main`) and the `tier1-backend` folder (deployed to AWS as `api.toolkit4me.com`).

## 1. What the platform actually is

| Area | Brief assumed | Actually in the repository |
|---|---|---|
| Frontend framework | Next.js | **Vite 8 + React 19 single-page app** with React Router 7, react-helmet-async, Tailwind CSS 4 |
| Server rendering | Next.js SSR/SSG | **Build-time prerender** (`scripts/prerender.ts`) writes static HTML for every route; React takes over in the browser |
| Hosting | Vercel | Vercel (`vercel.json`: clean URLs, no trailing slash, `/blog` → `/guides` 308, long cache for `/assets`) |
| Backend | Node.js on AWS | **Fastify 5 + TypeScript** (`tier1-backend`), job queue in memory, temp files on local disk (S3 provider exists but defaults to `local`), files deleted after 1 hour |
| Database | "inspect" | **None.** No database, no user accounts, no authentication |
| Analytics | "inspect" | **None** besides Google AdSense (`ca-pub-6133117250071116`). No Google Analytics, no cookies set by the site itself |
| Tests | "inspect" | Vitest + Testing Library (frontend, 240 tests in 16 files); Vitest (backend). Real-browser checks are Playwright scripts kept outside the repo |

**Consequence:** no framework migration (the brief forbids it anyway). Every instruction phrased for Next.js is applied to the Vite + prerender equivalent; see `ARCHITECTURE_DECISIONS.md` ADR-01.

## 2. Frontend structure

```
src/
  App.tsx                routes: /, /tools, /tools/:slug, /guides, /guides/:slug, legal pages, 404
  data/tools.ts          17 file tools (ToolDefinition objects)
  data/utilityTools.ts   9 browser utilities (JSON, QR, resizer, word counter, diff, Base64, page numbers, WebP, meta tags)
  data/guides.ts         41 guides + helpers
  lib/toolRegistry.ts    central registry: byId, bySlug, ordered (feeds nav, home, directory, related tools, sitemap, prerender)
  lib/seo/               SEO head, structured data builders, sitemap generation, page list
  lib/processing/        client processors (canvas, pdf-lib, jsPDF) per tool
  lib/textTools/         pure logic for the text/web utilities (all unit-tested)
  components/tools/      generic ToolPage template, upload workspace, custom workspaces registry
  components/layout/     Header, MobileNav, SearchBar, Footer, Breadcrumb
  components/ads/        AdSense units (kept out of the tool workspace by design)
scripts/                 generate-seo-files.ts, prerender.ts, seo-tracker.ts
```

A **central, type-safe tool registry already exists** (`ToolDefinition` in `src/types/tool.ts`, collected by `src/lib/toolRegistry.ts`). It already drives navigation, homepage, `/tools`, related tools, sitemap and prerender. Release 1 extends it rather than creating a second one.

## 3. Backend

Routes: `GET /health`, `POST /api/v1/process/:tool`, `GET /api/v1/jobs/:id` (+ download). Processors: compress PDF (Ghostscript), merge PDF (qpdf/pdf-lib), PDF to JPG, PDF to Word, Word/PowerPoint/Excel to PDF (LibreOffice), image to text (tesseract.js), protect/unlock/unprotect PDF (qpdf). Security: helmet, CORS, rate limit (`RATE_LIMIT_MAX`), file-type sniffing, safe paths, safe subprocess, max 20 files per request, 1-hour file TTL.

The backend folder is **not under git** on this machine. No backend change is planned in any release of this brief.

## 4. Existing tools

26 published tools: 11 run on the server, 15 entirely in the browser. Full table in `EXISTING_TOOLS_INVENTORY.md`. From the brief's "potential" list, these **do not exist** and are not added by assumption: PDF to Excel, PDF to PowerPoint, JSON Generator, SQL Query Fixer, SQL Query Generator. HEIC was previously deferred by the owner.

## 5. SEO and indexing state

See `SEO_BASELINE.md`. Summary: 76 indexable URLs in a sitemap index with three child sitemaps, all returning 200 on the canonical `https://www.toolkit4me.com` host; the apex domain 308-redirects to www. Unique titles, descriptions and H1s on every page (enforced by a dist audit script). Structured data: WebSite + Organization (home), WebApplication + BreadcrumbList + FAQPage (tools), BlogPosting + BreadcrumbList (guides). The Search Console 404 the owner saw was caused by submitting the non-www sitemap URL, not by a missing file.

## 6. Risks found

| # | Risk | Severity | Plan |
|---|---|---|---|
| R1 | Every page downloads the full text of all 41 guides (~194 KB raw / 64 KB gzip) because `structuredData.ts` imports two small helpers from `data/guides.ts`, pulling the whole file into the shared `SeoHead` chunk | Medium (performance) | Release 1: move the helpers to a light module |
| R2 | Navigation categories in the brief (Video & Audio, Link Studio, Calculator Hub, Pixel Playground) have no tools today. Linking empty hubs creates thin pages during an AdSense low-value-content review | High (AdSense) | A hub appears in navigation, home and sitemap only when it has at least one released tool (ADR-03) |
| R3 | Brief asks for ~30 creative tools and 30 calculators. Many near-identical thin pages could worsen the AdSense assessment | High (AdSense) | Each tool ships with unique, specific content and real functionality; batches are released only after review; weak ideas are deferred (ADR-08) |
| R4 | Many "AI" tools need large models; several popular models have non-commercial licences | High (legal/quality) | Evaluated individually in Release 5; nothing is labelled AI unless a model actually runs (ADR-06) |
| R5 | Link Studio needs persistent storage and a redirect service; none exists, and the brief forbids new AWS infrastructure | Blocking for Release 4 | Architecture document only until the owner approves a Cloudflare account and DNS change (ADR-05) |
| R6 | Backend folder isn't version-controlled locally | Medium (operations) | Recommend committing it to a private repository; out of scope to change |
| R7 | A global visual redesign changes every page at once while the site is under AdSense review | Medium | Design tokens evolve the existing system; layout and content stay; released on a branch and deployed only after owner approval |

## 7. Reusable building blocks

- `ToolDefinition` + `toolRegistry` (registry), `ToolPage` template (all tool pages), custom workspace registry (`components/tools/workspaces/registry.tsx`) for interactive tools.
- `ClientToolWorkspace` + client processors: file input, validation, preview, results, downloads for browser image/PDF tools.
- `FileDropZone`, `ResultCard`, `Alert`, `Button`, `ProgressIndicator`, `ToastProvider`, `SectionBody`.
- `downloadBlob`, `validateFiles` (signature checks), `format` helpers.
- SEO: `SeoHead`, structured data builders, sitemap generator driven by the registry and guides.

## 8. Obsolete or duplicate items

- `src/assets/react.svg`, `src/assets/vite.svg`: Vite template leftovers. `src/assets/hero.png`: check use before removing (not removed in this release).
- `tier1-frontend_3` and `Previous builds` folders beside the repository are older copies; not touched.
- No duplicate tool definitions were found.
