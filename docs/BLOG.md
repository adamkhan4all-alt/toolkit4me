# Blog & Resource Center — how it works and how to publish

## Architecture

| Piece | Where |
|---|---|
| Routes | `/blog`, `/blog/<slug>`, `/blog/category/<id>`, `/blog/tag/<tag>` (`src/App.tsx`) |
| Articles (one file each) | `src/data/blog/articles/<slug>.ts`, registered in `articles/index.ts` |
| Types / categories / tags / author | `src/data/blog/types.ts`, `categories.ts`, `tags.ts`, `authors.ts` |
| Listing helpers (search, related, reading time) | `src/data/blog/meta.ts` |
| Generated listing index + per-article loaders | `src/data/blog/blogIndex.generated.ts` (written by `npm run seo:generate`, part of `dev` and `build`) |
| Pages | `src/pages/blog/*` |
| Components | `src/components/blog/*` — `ArticleCard`, `FeaturedArticle`, `ArticleCategoryBadge`, `ArticleTableOfContents`, `ArticleAuthor`, `ArticleImage`, `ArticleReferences`, `RecommendedToolCard`, `RelatedArticles`, `ArticleCTA`, `ArticleGrid` (load more), `BlogSearch`, `BlogCategoryNav`, `ArticleBody`, `InlineText` |
| Images | `public/images/blog/<slug>/` — `hero.svg`, diagrams (`.svg`), screenshots/results (`.webp`), `share.png` (1200×630, Open Graph) |
| SEO | `BlogPosting` + `BreadcrumbList` JSON-LD (`src/lib/seo/structuredData.ts`), `sitemap-blog.xml` (`src/lib/seo/blogPages.ts`), full static HTML rendered from the React pages (`scripts/render-pages.ts` → `scripts/prerender.ts`) |

No CMS, database or new dependency. The listing pages download only the small generated index; each article's text is its own chunk.

**Indexing rules.** Category pages are indexed once they have an article; tag pages once they have two. Until then they render for readers with `noindex, follow` and stay out of the sitemap. Drafts (`status: "draft"`) never reach the index, sitemap or prerender.

## Publishing an article

1. Copy an existing file in `src/data/blog/articles/` to `<slug>.ts` and add it to `articles/index.ts`.
2. Fill in every field (see `types.ts`). Text supports `[link text](/path)` and `**bold**` only — no HTML.
3. Tools are referenced by registry **id** in `relatedTools` (first = main call to action). Never type a tool URL that isn't in the registry.
4. Images: put files in `public/images/blog/<slug>/`, declare their real pixel width/height, a descriptive alt (40+ characters) and the right `kind`:
   - `illustration` / `diagram` — original artwork; never presented as tool output.
   - `screenshot` / `result` — captured from the real tool; sample files must be made up and say so.
   Render `share.png` (1200×630) from the hero.
5. Set `status: "published"`, `published` and `updated` dates, then run `npm test` and `npm run build && npm run seo:validate`.

The tests (`src/data/blog/__tests__/blog.test.ts`) fail the build if an article uses an unknown tool id, guide, article, tag or category; links to a route that doesn't exist or to a non-https site; declares the wrong image size; lacks a share image; or if the generated index is stale.

## Editorial standards (summary of `/editorial-policy`)

Verify every tool claim against the tool's code or by running it; cite primary sources for anything else and open each one before citing it; no invented statistics, testimonials or capabilities; state limits next to recommendations; link to guides instead of duplicating them.

## Editorial calendar (20)

Status as of 2026-11-13. The seven topics already covered by guides (scanned docs → text, image compression for SEO, Office → PDF, merging PDFs, OCR, reducing PDF size, image formats) are linked from articles rather than rewritten.

| # | Article | Category | Status |
|---|---|---|---|
| 1 | 10 Free Online Tools That Help Small Businesses Save Time and Money | Freelancers & Small Businesses | **Published** |
| 2 | How Students Can Use PDF Tools to Study More Efficiently | Education & Learning | **Published** |
| 3 | How to Protect Sensitive Information Before Sharing Documents | Online Security & Privacy | **Published** |
| 4 | How Freelancers Can Prepare Professional Documents Without Expensive Software | Career & Professional Development | **Published** |
| 5 | How to Improve Your Digital Workflow with Free Browser-Based Tools | Digital Tools & Tutorials | **Published** |
| 6 | 7 Digital Skills Every Professional Should Learn | Career & Professional Development | Planned |
| 7 | How Online Tools Improve Everyday Office Productivity | Business & Productivity | Planned |
| 8 | The Role of AI Tools in Modern Professional Work (must state Toolkit4Me's tools don't use generative AI) | Technology & AI | Planned |
| 9 | Best Free Tools for Students and Teachers | Education & Learning | Planned |
| 10 | How to Prepare Better Presentations for Professional Meetings | Career & Professional Development | Planned |
| 11 | How Digital Productivity Tools Help Remote Teams | Business & Productivity | Planned |
| 12 | Budgeting Maths Every Freelancer Needs (Calculator Hub) | Freelancers & Small Businesses | Planned |
| 13 | UTM Tracking for Small-Business Marketing (Link Studio) | Freelancers & Small Businesses | Planned |
| 14 | Short Links and QR Codes on Printed Materials | Business & Productivity | Planned |
| 15 | Understanding File Sizes: MB, MiB and Why Your Drive Looks Smaller | Technology & AI | Planned |
| 16 | How OCR Works — and Why It Fails on Some Scans | Technology & AI | Planned |
| 17 | Making Social-Media Images the Right Size (Pixel Playground) | Digital Tools & Tutorials | Planned |
| 18 | Digital Privacy Basics: Metadata, Tracking Links and What Websites See | Online Security & Privacy | Planned |
| 19 | Creating Professional Documents with Free Tools (merge into #4 if too similar) | Career & Professional Development | On hold |
| 20 | Essential Online Tools for Small Business Owners (overlaps #1 — refresh #1 instead) | Freelancers & Small Businesses | On hold |

Business & Productivity and Technology & AI have no published article yet, so their pages are `noindex` until #7 / #8 ship.

## Release 5 — QA record (2026-11-13, branch `release-5-blog`)

| Check | Result |
|---|---|
| TypeScript (`tsc -b`) | ✅ clean |
| Lint (`oxlint`) | ✅ 7 warnings, none in new code; baseline was 8 (one was an unused import removed from `prerender.ts`) |
| Unit/integration tests | ✅ 525 / 525 (baseline 462; +63: blog content rules, index sync, search, related, sitemap, routing for every article/category/tag, `/terms` redirect, footer, SeoHead, blur-tool pointer mapping) |
| Production build + prerender | ✅ 163 static pages (29 blog pages: home, 5 articles, 7 categories, 16 tags) |
| `seo:validate` | ✅ 163 pages, 9 child sitemaps, 151 URLs — one H1/title/description each, canonicals, valid JSON-LD, no broken internal links, no duplicate titles/descriptions |
| Browser (Edge, production build) — every sitemap URL + noindex blog pages + `/terms`, at 1280 px and (blog/policy/home) 375 px | ✅ 189 page loads, 0 failures: no runtime errors, no not-found pages, no horizontal overflow, all images load with alt text, every external link opens in a new tab with `noopener noreferrer`, every table-of-contents anchor resolves |
| Header at 375/768/1024/1099/1100/1280 px | ✅ no overflow (fixes an 88 px overflow that existed on `main` at 768 px — desktop nav now from 1100 px, menu button below) |
| Bundle | main entry 457.4 KB → 458.5 KB (+1.1 KB); article text only in each article's own chunk; ad configuration compiles identically to `main` |

**Also fixed (existing bug found while capturing the redaction example):** the Face Blur & Privacy Editor mapped pointer positions against the whole canvas element, which is letterboxed (`object-fit: contain`) for tall images, so hidden boxes landed beside where the user dragged. Mapping now uses the drawn image (`pointOnContainedCanvas`, tested).

**Not testable locally:** Vercel's `/terms → /terms-of-use` 308 redirect (the in-app route redirect is tested) and live HTTP checks (`npm run seo:validate -- --live`) — run both after deployment.

## Release 5 — deployment (2026-11-13)

| Item | Result |
|---|---|
| Commits | `2c61b73` (Release 5), merged to `main` as `71d0155` |
| Vercel | project `project-587l0`, Production deployment `project-587l0-9z55arrhq` — live; Hobby plan unchanged; no new project |
| Live redirect | `/terms` → 308 → `/terms-of-use` ✅ |
| Live sitemaps | `sitemap.xml` lists `sitemap-blog.xml`; all 151 sitemap URLs answer 200 directly, none with an `X-Robots-Tag: noindex` ✅ |
| Browser suite on production | 189 page loads (157 URLs: every sitemap URL, noindex blog pages, `/terms`) at 1280 px and 375 px — 0 failures; header checked at 375–1280 px; mobile menu → Blog ✅ |

Nothing was changed in the AWS backend, the Cloudflare Worker/D1, DNS or environment variables.
Rollback: Vercel → Deployments → promote `project-587l0-f886whkql` (the previous production deployment). The release adds pages and data; rollback has no data impact. Note that rolling back also restores the old `/blog → /guides` redirect and `/terms` page.
