# Blog & Resource Center — Batch 1: Audit and Plan

Status: audit complete; implementation waits for owner decisions (§8). Nothing in production has changed.

## 1. Architecture facts that shape this release

| Brief assumption | Actual | Consequence |
|---|---|---|
| Next.js app | Vite + React SPA; every public page is **prerendered to static HTML** at build time (`scripts/prerender.ts`) | Blog pages are crawlable without SSR: same prerender approach as guides, tools and calculators. No server components needed. |
| Vercel project `project-58710` | The live project is **`project-587l0`** (lower-case L), Hobby plan | Deploy through it unchanged. |
| No blog exists | A **Guides** section already exists: `/guides` + **41 published how-to guides** (`src/data/guides.ts`), 5 guide categories, `BlogPosting` JSON-LD, author "Toolkit4Me Editorial Team", `sitemap-guides.xml`. **`/blog` currently 308-redirects to `/guides`** (`vercel.json`). | The Blog must be designed around these 41 indexed URLs — see decision D1. |
| CMS needed | Guides are typed TypeScript data files; a generated index (`guideIndex.generated.ts`) keeps listing pages light | Reuse this file-based pattern for articles (draft/published, categories, tags, featured, references…). No CMS, database or new dependency. |

## 2. Content overlap with the proposed 20 topics

Seven proposed topics are already covered by published guides. Publishing them again would create duplicate pages competing for the same searches.

| Proposed topic | Existing guide |
|---|---|
| 3. Convert scanned documents into editable text | `how-to-extract-text-from-images-ocr`, `scanned-pdf-vs-text-pdf` |
| 6. Why image compression matters for speed and SEO | `how-to-compress-images`, `what-size-should-website-images-be` |
| 7. Convert Excel and PowerPoint to PDF | `convert-office-documents-to-pdf`, `how-to-fit-excel-sheet-on-one-page-pdf` |
| 8. Merge multiple PDFs | `how-to-merge-and-organize-pdfs` |
| 12. Extract text from images using OCR | `how-to-extract-text-from-images-ocr`, `how-to-copy-text-from-a-screenshot` |
| 15. Reduce PDF size without losing readability | `how-to-reduce-pdf-file-size` |
| 19. JPG, PNG, WebP and AVIF | `jpg-vs-png`, `how-to-convert-webp-to-jpg` (partial — AVIF not covered) |

Plan: these seven are linked from the new articles instead of rewritten. Topic 19 becomes an update to the existing guide if AVIF coverage is wanted (no Toolkit4Me tool converts AVIF, so the article can't recommend one).

## 3. Proposed editorial calendar (20)

**First batch (5) — broad, non-overlapping, each links to real tools:**

| # | Article | Category | Main tools linked |
|---|---|---|---|
| 1 | 10 free online tools that help small businesses save time and money | Freelancers & Small Businesses | Compress PDF, Merge PDF, Word to PDF, Compress Image, QR Code Generator, Profit Margin / Discount calculators, UTM Builder |
| 2 | How students can use PDF tools to study more efficiently | Education & Learning | Merge / Split / Compress PDF, Image to Text, JPG to PDF, Page Numbers, GPA & Required Marks calculators |
| 3 | How to protect sensitive information before sharing documents | Online Security & Privacy | Protect PDF, EXIF guide, Blur Image Areas, PDF Editor, URL Cleaner |
| 4 | How freelancers can prepare professional documents without expensive software | Career & Professional Development | Word/Excel/PowerPoint to PDF, Page Numbers, Protect PDF, Compress PDF, Markup calculator |
| 5 | How to improve your digital workflow with free browser-based tools | Digital Tools & Tutorials | Browser-only tools; explains browser vs server processing honestly |

**Later batches (15):** 4 Digital skills every professional should learn · 9 How online tools improve office productivity · 10 The role of AI tools in modern professional work (careful: Toolkit4Me has no AI tools — article must say so) · 13 Best free tools for students and teachers · 14 Creating professional documents with free tools (merge with #4 if too similar) · 16 Essential tools for small business owners (merge with #1) · 17 Preparing better presentations · 18 Productivity tools for remote teams · plus new topics that fill gaps without overlap: *Budgeting maths every freelancer needs* (Calculator Hub) · *UTM tracking for small-business marketing* (Link Studio) · *Short links and QR codes on printed materials* · *Understanding file sizes: MB, MiB and why your drive looks smaller* · *How OCR works and why it fails on some scans* · *Making social-media images the right size* (Pixel Playground) · *Digital privacy basics: metadata, tracking links and what websites see*.

Each article: verified steps, real tool routes only, references to primary sources (vendor docs, standards bodies, government guidance) only where a factual claim needs one, no invented statistics.

## 4. Tool-link and third-party audit

**Result: no unexpected redirects exist.** Every tool card, menu item, search result and CTA opens an internal Toolkit4Me route in the same tab.

| Area | Destination | Classification | Third party | Expected? |
|---|---|---|---|---|
| 35 browser tools (`/tools/<slug>`) | Internal page; processing in the browser | Internal | none | ✅ |
| 11 server tools: pdf-to-word, word-to-pdf, pdf-to-jpg, compress-pdf, merge-pdf, image-to-text, powerpoint-to-pdf, excel-to-pdf, unlock-pdf, protect-pdf, unprotect-pdf | Internal page; file sent to `api.toolkit4me.com` (Toolkit4Me's own AWS server — LibreOffice, Ghostscript, qpdf, Tesseract) | Internal + own backend | AWS (hosting) | ✅ disclosed on each page |
| 30 calculators (`/calculators/<slug>`) | Internal, browser-only | Internal | none | ✅ |
| Link Studio tools | Internal, browser-only | Internal | none | ✅ |
| Link Studio admin | `/api/link-studio/*` (Vercel Functions) → Cloudflare Worker | Internal | Cloudflare (Worker/D1), GitHub (team sign-in) | ✅ admin-only |
| Short links | `go.toolkit4me.com/<code>` → owner-chosen destination | External by design | Cloudflare | ✅ |
| Ads | Google AdSense script (`index.html`), preconnect to Funding Choices (Google consent messaging) | Third-party script | Google | ✅ — ads are labelled, never inside workspaces (ADR-09) |
| External hrefs in pages | Google ad-settings links (Privacy Policy) | External, new tab, `noopener noreferrer` | Google | ✅ |
| `window.open` / script-driven navigation | Only `ErrorBoundary` → `/` | Internal | — | ✅ |
| AI services (Gemini, ChatGPT, OpenAI, …) | **None in the codebase** | — | — | ✅ |

A "Gemini" label seen while browsing the site is not produced by Toolkit4Me's code. The likely source is the browser itself (Chrome's built-in Gemini button) or a browser extension, or possibly an ad creative. Nothing on the site launches an AI service.

## 5. Privacy data-flow audit (basis for the policy update)

| Flow | What is received | Where | Retention (verified in code) |
|---|---|---|---|
| Browser tools, calculators, URL tools | Nothing leaves the device | Visitor's browser | — |
| Server tools | The uploaded file (+ password for protect/unlock, used once) | `api.toolkit4me.com` (AWS) | Upload temp dir removed when processing ends; result kept ≤ 1 h (`FILE_TTL_MS`), swept automatically |
| Server request logs / rate limiting | IP address, request path, time (Fastify/pino logs; per-IP rate limit) | AWS | **Log retention: owner input needed** |
| Short-link clicks | Time, code, referrer domain, country code, device type; no IP/UA stored; 60 s hashed dedupe key | Cloudflare D1 | Click rows 365 days; totals kept |
| Cloudflare request handling | IP etc. for delivery and abuse protection | Cloudflare | Cloudflare's own policy |
| Admin sign-in | GitHub numeric id + login in a signed 8 h cookie (team only) | Vercel Functions | Cookie only; nothing stored server-side |
| Hosting | Standard request logs | Vercel | Vercel's own policy |
| Advertising | Cookies / identifiers | Google AdSense | Google's policy; **whether the Google consent message (EEA/UK) is enabled: owner to confirm** |
| Analytics | None installed (no Google Analytics, no other tracker) | — | — |

Caveat: the backend audit used the copy in `tier1-backend/` on this machine. The owner should confirm the AWS server runs the same version.

## 6. Implementation plan (Batches 2–8)

**Routes:** `/blog`, `/blog/<slug>`, `/blog/category/<category>`, `/blog/tag/<tag>` (all prerendered), `/terms-of-use` (+ 308 from `/terms`). Guides URLs depend on D1.

**Files to create:** `src/data/blog/` (`types.ts`, `categories.ts`, `authors.ts`, one file per article, generated `blogIndex.generated.ts`), `src/pages/blog/` (`BlogHomePage`, `ArticlePage`, `BlogCategoryPage`, `BlogTagPage`), `src/components/blog/` (`ArticleCard`, `FeaturedArticle`, `ArticleCategoryBadge`, `ArticleTableOfContents`, `ArticleAuthor`, `ArticleImage`, `ArticleReferences`, `RecommendedToolCard`, `RelatedArticles`, `ArticleCTA`, `BlogSearch`), `public/images/blog/…`, `docs/BLOG.md`.

**Files to modify:** `App.tsx` (routes), `Header`/`MobileNav`/`Footer` (Blog item; footer regrouped as Toolkit4Me · Legal & Privacy · Editorial), `vercel.json` (remove `/blog → /guides`; add `/terms → /terms-of-use`), `scripts/prerender.ts`, `scripts/generate-seo-files.ts`, `src/lib/seo/sitemap.ts` (+ `sitemap-blog.xml`), `src/lib/seo/pages.ts`, `structuredData.ts`, About / Privacy / Terms (renamed `TermsOfUsePage`) / Disclaimer / Editorial Policy pages, and existing tests that reference `/terms` or "Terms of Service".

**Reused:** `SeoHead`, `Breadcrumb`, `SectionBody`, `FAQ`, `ToolCard`, `articleSchema`/`breadcrumbSchema`, the generated-index pattern, the hub/listing registry (for verified tool links), AdSense components (in-content only, as on guides).

**Search & pagination:** client-side search over the small generated index (titles, excerpts, tags) — no full article text in the listing bundle; 9 articles per page with numbered, crawlable `/blog?page=` links or a load-more button over the index.

**Tool links:** articles reference tools by **id**, resolved through the registry; a build-time test fails if any id or `/tools/` / `/calculators/` link doesn't exist.

**Images:** see D2. All images get width/height (no layout shift), `loading="lazy"` below the fold, WebP, descriptive alt text, and a caption labelling illustrations as illustrations.

**Policy pages:** rewritten from §5 facts; no Article schema; unique titles/descriptions; each lists "last updated".

**QA:** unit tests (content schema, links, categories, sitemap), `seo:validate`, Playwright desktop + 375 px for every blog/policy URL, full-site regression over all sitemap URLs, live verification after deploy.

## 7. Owner input needed for the legal pages

1. **Operator identity** for the policies: individual or registered business? Its legal name (none will be invented).
2. **Governing law / jurisdiction** for the Terms of Use (e.g. Pakistan, England & Wales, …).
3. **Minimum age** for using the site (commonly 13, or 16 in parts of the EEA).
4. **AWS server-log retention** period, if one is configured.
5. **Google consent message** (AdSense → Privacy & messaging) enabled for EEA/UK visitors: yes/no.
6. **Author**: keep "Toolkit4Me Editorial Team", or name a real person (with a short, true bio)?

Until answered, the pages say "the operator of Toolkit4Me", omit a governing-law clause, and omit any retention period they can't verify.

## 8. Decisions needed before Batch 2

- **D1 — Blog and the existing Guides** (see options presented with this report).
- **D2 — Images** (original SVG illustrations + real screenshots, or also licensed stock photography).
- **D3 — First five articles** as listed in §3.
