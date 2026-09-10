# Tier1Tools — Frontend Foundation + Reusable Tool Framework

React + TypeScript + Vite + React Router + Tailwind CSS. No backend yet —
processing is mocked so the full UI/UX can be exercised end-to-end.

## Run it

```bash
npm install
npm run dev      # dev server
npm run build    # production build (tsc -b && vite build)
npm run test     # vitest — registry + routing tests
```

## Phase 4 — Reusable Tool Framework

### `ToolDefinition` (`src/types/tool.ts`)

The single data contract every tool conforms to: `id`, `name`, `slug`,
`category`, `description`, `acceptedFormats`, `maxFileSize`,
`processingMode` (`"CLIENT" | "SERVER"`), `endpoint`, `seo` metadata
(`title`, `metaDescription`, `h1`, `keywords`), `faq`, `relatedTools`, plus
the fields the UI needs (`options`, `howItWorks`, `features`, etc).

- `processingMode: "CLIENT"` — the tool runs entirely in the browser; `endpoint` is `null`.
- `processingMode: "SERVER"` — the tool uploads to `endpoint` for processing.

Today `compress-image`, `jpg-to-png`, and `png-to-jpg` are marked `CLIENT`
(a canvas-based implementation is a natural fit); the rest are `SERVER`.
Neither mode has real processing wired up yet — both still go through the
same mocked pipeline — but the flag is threaded through the framework
(e.g. `PrivacyNotice` copy changes based on it) so swapping in the real
implementation later doesn't require touching the framework again.

### `ToolRegistry` (`src/lib/toolRegistry.ts`)

Centralized, validated lookup layer. Built once from
`TOOL_DEFINITIONS` (`src/data/tools.ts`) and exported as the `toolRegistry`
singleton. Throws at module load if two tools share an `id` or `slug`, so a
data-entry mistake fails immediately instead of producing a broken route.

API: `getAll()`, `getById(id)`, `getBySlug(slug)`, `getByCategory(category)`,
`getRelated(tool)`, `search(query)`, `has(slug)`, `count()`.

The `ToolRegistry` class is also exported directly so tests can build
isolated registries from fixtures without touching the singleton.

### Router integration

`src/App.tsx` defines one dynamic route, `/tools/:slug`, which resolves
through `src/pages/ToolPage.tsx` (`ToolPageRoute`) — the *only* place the
router talks to tool data. It looks up the slug in `toolRegistry`, and
either renders the generic `ToolPage` framework component with the
resolved `ToolDefinition`, or redirects to `/tools` if the slug is unknown.

**Adding tool #11 requires exactly one change:** append a `ToolDefinition`
object to `TOOL_DEFINITIONS` in `src/data/tools.ts`. No new route, no new
page component, no registry code, no UI code.

### Reusable component set (`src/components/tools/` + `src/components/ui/`)

| Component | Responsibility |
|---|---|
| `ToolPage` | Generic page composition — the only tool-page layout that exists |
| `ToolHeader` | Breadcrumb + H1 + description |
| `FileDropZone` | Drag-and-drop / file-picker upload surface |
| `FileList` | Renders selected files + aggregate size for multi-file tools |
| `FilePreview` | Thumbnail for images, type-glyph badge otherwise |
| `ToolOptions` | Schema-driven select/radio options panel |
| `ProcessButton` | Primary per-tool CTA, sticky on mobile once enabled |
| `ProcessingState` | Uploading (determinate) / Processing (indeterminate) UI |
| `ProgressIndicator` | Determinate + indeterminate progress bar primitives |
| `ResultCard` | Completed-state card (uses `DownloadButton`) |
| `DownloadButton` | Standalone download CTA |
| `ErrorState` / inline error block | Error-state UI with retry |
| `PrivacyNotice` | Trust copy, adapts to `processingMode` |
| `AdSlot` | 5 reusable ad placeholder variants |
| `ToolInstructions` | "How it works" numbered steps |
| `FAQ` | Accordion, per-tool Q&A |
| `RelatedTools` | Pulls related tools via `toolRegistry.getRelated` |

No tool page contains bespoke markup — every tool renders through the same
`ToolPage` component tree, differing only by the `ToolDefinition` passed in.

### Tests (`npm run test`)

- `src/lib/__tests__/toolRegistry.test.ts` — registry contents, lookup by
  slug/category, related-tool resolution (including unknown-id handling),
  search, SEO/FAQ completeness per tool, and constructor-level duplicate-id/
  slug validation.
- `src/__tests__/routing.test.tsx` — renders `<App>` at `/`, `/tools`, every
  `/tools/:slug` route (asserting the correct H1 per tool), an unknown tool
  slug (redirects to `/tools`), and an unrelated unknown path (404 page);
  also asserts every tool's process button renders.

## Routes

- `/`
- `/tools`
- `/tools/pdf-to-word`
- `/tools/word-to-pdf`
- `/tools/jpg-to-pdf`
- `/tools/pdf-to-jpg`
- `/tools/compress-pdf`
- `/tools/merge-pdf`
- `/tools/compress-image`
- `/tools/image-to-text`
- `/tools/jpg-to-png`
- `/tools/png-to-jpg`

## Phase 8 — SEO layer

This is a client-rendered SPA (Vite + React Router, `createRoot`, no SSR
framework), which is fine for Googlebot — it executes JavaScript — but is a
real gap for crawlers/bots that don't (most social link-preview scrapers,
some simpler SEO tools). The SEO layer below has two halves that work
together: a runtime half for real visitors and JS-executing crawlers, and a
**build-time prerender** for everyone else.

### Per-page content and metadata

Every one of the 10 tool routes (plus `/` and `/tools`) now has, driven
entirely by its own `ToolDefinition` (`src/data/tools.ts` — nothing shared/
boilerplate):

- a unique `<title>` and meta description (`tool.seo.title` / `metaDescription`)
- a unique H1 (`tool.seo.h1`)
- unique introductory content — 1–2 paragraphs per tool (`tool.intro`), new in Phase 8, written to explain the tool's actual use case rather than restate the meta description
- how-to instructions (`tool.howItWorks`, rendered by `ToolInstructions`)
- a dedicated "Supported formats" section (`SupportedFormats.tsx`) — accepted formats, max size, and output, from `tool.acceptedFormats`/`maxFileSize`/`outputExtension`/`formatsNote`
- a dedicated "Privacy & security" section (`PrivacySection.tsx`) — copy that's actually accurate to the tool's `processingMode` (client-only vs. server-processed-then-deleted), not generic boilerplate
- FAQ (`tool.faq`, rendered by `FAQ.tsx`, also emitted as FAQPage JSON-LD)
- related tools (`RelatedTools.tsx`, pulls `tool.relatedTools` via the registry) and a breadcrumb trail — both real internal `<Link>`s, plus the homepage's "About our tools" section links into several tool pages inline

None of this content is keyword-stuffed — copy is written as normal
sentences describing what the tool actually does and when you'd use it, not
lists of search terms.

### `SeoHead` (`src/components/seo/SeoHead.tsx`)

A single component, rendered once per routed page, that owns the entire
`<head>` for that page via `react-helmet-async`: title, meta description,
canonical URL, Open Graph tags, Twitter/X Card tags, and JSON-LD
(`BreadcrumbList` always; `FAQPage` when the page has one). `HelmetProvider`
wraps the app in `main.tsx`. This is what keeps the `<head>` correct as a
user navigates client-side between tool pages without a full reload.

### Static prerender (`scripts/prerender.ts`)

Runs as the last step of `npm run build` (after `vite build`). For each of
the 12 routes, it writes a **real physical file** —
`dist/tools/pdf-to-word/index.html`, etc. — containing the correct
`<title>`/meta/canonical/OG/Twitter tags and JSON-LD baked directly into
the HTML, plus real visible fallback content inside `#root` (H1, intro, 
how-to steps, supported formats, privacy note, FAQ text, related-tool
links). Since `main.tsx` uses `createRoot(...).render(...)` rather than
`hydrateRoot`, React simply clears and replaces that content once its JS
loads — there's no hydration-mismatch concern, and interactive visitors see
the exact same app either way.

**Static hosting note, found during verification:** a host that resolves
`/tools/compress-pdf` (no trailing slash) straight to `dist/tools/compress-pdf/
index.html` gets everything above correctly. `vite preview`'s own dev-only
static server was used to check this locally and does **not** do that
resolution for extensionless paths without a trailing slash — it falls back
to the SPA's root `index.html` instead (`/tools/compress-pdf/`, with the
slash, resolves correctly). Real static hosts vary here (Netlify, Vercel,
and S3+CloudFront-with-default-root-object generally do resolve it;
a bare nginx `try_files` config may need an explicit rule to prefer
`$uri/index.html`). Whichever host is used in production, confirm
`curl -s https://<domain>/tools/pdf-to-word | grep '<title>'` returns the
tool-specific title, not the homepage's — if it doesn't, add an index-file
resolution rule for the host in question. Either way this only affects
non-JS crawlers/scrapers hitting that exact URL shape; real visitors and
Googlebot's JS-rendering pass get the correct page regardless, since
client-side routing and `SeoHead` don't care about trailing slashes.

### `sitemap.xml` / `robots.txt` (`scripts/generate-seo-files.ts`)

Generated from the same `TOOL_DEFINITIONS` array the app renders from (so
they can't drift out of sync with real routes), written into `public/` as
a `predev`/`prebuild` step (`npm run seo:generate`) — Vite copies `public/`
verbatim into `dist/`. `robots.txt` allows everything and points at
`sitemap.xml`; the sitemap lists all 12 routes with a sensible
`changefreq`/`priority`.

### Canonical domain

`src/config/site.ts` is the single source of truth for the site's canonical
URL (`SITE_URL`, default `https://www.tier1tools.com` — a placeholder;
override at build time with `VITE_SITE_URL=https://your-real-domain.com npm
run build`), used consistently by `SeoHead`, the prerender script, and the
sitemap generator.

### Core Web Vitals

- **Route-level code splitting** (`src/App.tsx`, `React.lazy` + `Suspense`): the homepage's initial JS no longer bundles the tool-page framework, FAQ/related-tools components, or client-side image/PDF processing code — confirmed in the production build, where `HomePage`, `ToolsDirectoryPage`, `ToolPage`, and `NotFoundPage` each ship as separate chunks, and heavy libraries (`jspdf`, `html2canvas`) stay in their own lazy chunks pulled in only by the tools that use them (per Phase 5).
- No custom web fonts are loaded (the design system's font stack, `src/index.css`, is the system font stack) — no font-loading layout shift or render-blocking font request to optimize away.
- The static prerender above also means the browser has real, complete HTML to paint immediately on first load for every route, before the JS bundle finishes downloading/executing — good for LCP on a first visit, since there's real text content already in the DOM rather than a blank shell.
- No image is part of any tool page's critical rendering path (the only `<img>` in the codebase is `FilePreview`, which only renders after a user selects a file — well after any first-load LCP measurement).

### Tests

`npm run test` — 51 tests (up from 46 in Phase 4/5). `routing.test.tsx` was
updated for the new `React.lazy` routes: assertions now `await
screen.findByRole(...)` instead of `getByRole(...)` (content is no longer
synchronously available after `render()`), and every render is wrapped in
`HelmetProvider` since `SeoHead` now renders on every page. `npm run build`
was additionally run end-to-end and its output inspected directly: `tsc -b`
type-checks clean, `vite build` produces the expected route-split chunks,
and `scripts/prerender.ts` was confirmed to write all 12 static pages with
correct, unique `<title>`/meta/JSON-LD and real fallback content — verified
by reading the generated `dist/tools/pdf-to-word/index.html` directly and
by serving `dist/` with `vite preview` and diffing the returned `<title>`
per route (see the hosting note above for the one nuance that surfaced).

## Phase 9 — Advertising layer (Google AdSense)

The platform is free and monetized entirely through AdSense. This layer is
built so that (a) no publisher or ad-unit ID is ever hard-coded in a
page/component, and (b) ads are unmistakably ads — never styled or placed
in a way that could be confused with the app's own controls.

### Configuration (`src/config/ads.ts`)

The **only** place any AdSense identifier is read from. Everything else —
every one of the 5 ad components, the script loader — imports from here.

- `VITE_ADS_ENABLED` — master switch, defaults **off**. A fresh checkout,
  `npm run dev`, and CI never load the AdSense script or request a real ad
  unless this is explicitly set to `"true"`.
- `VITE_ADSENSE_CLIENT_ID` — the AdSense publisher ID.
- `VITE_AD_SLOT_BANNER` / `_RECTANGLE` / `_SIDEBAR` / `_MOBILE` / `_IN_CONTENT` — one ad-unit (slot) ID per placement, configured independently.

`isAdReady(placement)` is the single gate every component checks: the
master switch must be on, a publisher ID must be set, *and* that specific
placement's slot ID must be set. Missing any one of those falls back to the
development placeholder for that placement only — never a broken/empty
AdSense tag. See `.env.example` for the full list with comments; copy it to
`.env.local` to opt in locally.

### Components (`src/components/ads/`)

`AdBanner`, `AdRectangle`, `AdSidebar`, `AdMobile`, `AdInContent` — the 5
public components, each a thin wrapper around a shared, un-exported
`AdUnit` core that handles config resolution, the labeled placeholder vs.
real-unit branch, and AdSense script injection consistently. Adding a 6th
placement means one new wrapper file plus one new key in `AD_SLOT_IDS` —
never touching the rendering logic itself.

| Component | Size | Breakpoints | Typical use |
|---|---|---|---|
| `AdBanner` | 728×90 leaderboard | `sm:` and up | Horizontal section breaks (homepage) |
| `AdRectangle` | 300×250 medium rectangle | all | A single block-level spot |
| `AdSidebar` | 300×600 skyscraper, sticky | `lg:` and up only | Dedicated desktop sidebar column |
| `AdMobile` | 320×50 compact banner | below `sm` only | Small, in-flow mobile placements |
| `AdInContent` | fluid width, responsive | all | Breaks between long-form content sections |

### How ad safety/distinction requirements are actually enforced

- **Reserved layout space, no CLS:** every component sets a fixed or
  minimum-height box (see the table above) *before* knowing whether a real
  ad will fill it — the reserved space is identical whether the
  placeholder or a real ad renders.
- **Always visibly labeled:** every ad — placeholder or real — renders an
  "Advertisement" label in normal document flow directly above the ad box
  itself (not overlaid, so it can't visually merge with either the ad
  creative or surrounding content).
- **Never styled like app UI:** the ad frame uses a neutral gray
  background and a plain border (dashed in dev, solid muted in
  production) — nowhere close to the app's brand-blue filled buttons,
  and specifically never uses download/upload iconography or the
  `ProcessButton`/`DownloadButton` visual treatment.
- **Never inside the interactive tool area:** `UploadWorkspace` and
  `ClientToolWorkspace` (the drop zone, options, process button,
  progress state, and result/download card) contain zero ad
  components — verified by grep, not just by convention. Every ad
  placement on a tool page sits in a `<section>` *after* that workspace
  block, separated by at least one full informational section.
  See `ToolPage.tsx` for the concrete placement order.
- **No fixed/sticky ads that can drift over controls:** `AdMobile` is
  always rendered in normal in-page flow — never `position: fixed` — so
  it can't dock itself over the process button or a download link while
  scrolling on a small screen. `AdSidebar`'s `sticky` positioning is
  confined to its own dedicated `<aside>` layout column, which sits
  beside, never inside or over, the main content column.
- **Ad-blocker safe:** `requestAdFill()` swallows any error from
  `window.adsbygoogle.push` (ad blockers commonly strip that global) so a
  blocked ad request can never surface as an app error.

### Placement

- **Homepage:** one ad break between the hero and the tools grid
  (`AdBanner` + `AdMobile`, mutually exclusive by breakpoint), and one
  more (`AdInContent`) between the tools grid and the trust-points
  section — both squarely between major sections, never inside one.
- **Tool page:** `AdInContent` sits below the intro/how-it-works/
  supported-formats block, well clear of the workspace above it;
  `AdMobile` gives mobile visitors one additional small, in-flow
  placement lower on the page (after the privacy section, before FAQ);
  `AdSidebar` occupies the dedicated desktop sidebar column alongside
  the main content, only shown at `lg:` and up.
- **Tools directory page:** one `AdInContent` block below the tool grid.

### Tests

`src/components/ads/__tests__/AdUnit.test.tsx` (4 tests, part of the 55
total in `npm run test`) covers: the disabled-by-default state renders the
labeled placeholder and injects no AdSense script at all; an
enabled-but-incompletely-configured placement still falls back to the
placeholder rather than rendering broken markup; a fully-configured
placement renders a real `<ins class="adsbygoogle">` with the correct
client/slot attributes and injects the loader script exactly once; and the
"Advertisement" label is present in both the real-ad and placeholder cases.
A full `npm run build` was also run both with ads left disabled (the
default — confirms local/CI builds stay ad-free) and with a complete set of
placeholder AdSense env vars supplied (confirms the whole pipeline, ad
components included, builds cleanly end-to-end when a real publisher
config is present).
