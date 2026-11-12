# Architecture Decisions

Each decision records the context, the choice and its consequences. New decisions are appended; superseded ones are marked, never deleted.

## ADR-01 — Keep Vite + React + build-time prerender (no Next.js)
**Context:** The brief describes the frontend as Next.js. The repository is a Vite 8 + React 19 SPA with a prerender script that writes static HTML for every route. The brief also forbids framework migration.
**Decision:** Keep the current stack. "Static generation" = `scripts/prerender.ts`; "metadata API" = `SeoHead` (react-helmet-async) plus prerendered head tags; "route segments" = React Router routes driven by the registry.
**Consequences:** Every new hub page needs (a) a React route, (b) a prerender function, (c) an entry in the sitemap generator. All three are driven from the registry so they can't drift.

## ADR-02 — Extend the existing registry; no second registry
**Context:** `ToolDefinition` + `toolRegistry` already feed navigation, home, `/tools`, related tools, sitemap and prerender.
**Decision:** Add hub and discovery metadata (`hub`, `popular`, `addedOn`) to the existing type. Hubs (PDF Tools, Image Tools, Pixel Playground, Video & Audio, Calculator Hub, Developer Tools, Link Studio) are defined once in `src/data/hubs.ts`. Calculators get their own typed registry entries that share the same discovery fields, because their pages are formula-driven rather than file-driven.
**Consequences:** One place to add a tool. A tool is "released" by being in the registry; deferred ideas live only in docs, never in the registry.

## ADR-03 — A hub is visible only when it has released tools
**Context:** The site is recovering from an AdSense "low value content" assessment. Empty category pages and menu items leading to "coming soon" are thin content.
**Decision:** Navigation, homepage sections, hub pages and sitemaps are generated from hubs that contain at least one released tool. Video & Audio and Link Studio stay hidden until they have working tools.
**Consequences:** The navigation grows as releases ship. Nothing links to unfinished features.

## ADR-04 — New tools run in the browser; no new backend workload
**Decision:** Pixel Playground, Calculator Hub and URL utilities are implemented with Canvas, Web Workers, WebCodecs/WebAssembly where needed, loaded with dynamic `import()` so their code ships only on their own pages. No new endpoints, no uploads of user media to AWS.
**Consequences:** Processing limits depend on the visitor's device; each tool documents its limits.

## ADR-05 — Link Studio is gated on owner approval of external infrastructure
**Context:** Short links need persistent storage and a redirect service. The brief forbids new AWS infrastructure and prefers Cloudflare Workers + D1 on `go.toolkit4me.com`. This requires a Cloudflare account, a deployment and a DNS record on the owner's domain.
**Decision:** Release 4 delivers `LINK_STUDIO_ARCHITECTURE.md` and browser-only URL utilities (UTM builder, URL parser/cleaner, encoder/decoder) that need no server. Short-link creation is not exposed until the gate in the brief passes and the owner approves the account, cost and DNS change.

## ADR-06 — "AI" means a model actually runs
**Decision:** A tool is called AI only if it runs a machine-learning model. Filters (sketch, cartoon, colour effects) are labelled as filters. Each candidate model is checked for licence (code and weights), size, memory and browser support before use. Models with non-commercial licences are rejected.
**Consequences:** Several brief items (AI image generator, headshots, avatars, restoration, outpainting, hairstyle preview) are deferred: they need multi-gigabyte diffusion models or GPUs that most visitors' browsers can't run.

## ADR-07 — Design refresh evolves the existing token system
**Decision:** Refresh `src/index.css` design tokens (palette, accent gradient, radii, shadows, motion) and shared components; keep Tailwind; add no UI framework or animation library. Keep the system font stack (no web-font download) for speed. Animations are CSS/SVG, respect `prefers-reduced-motion`, and never sit above the fold as heavy media.

## ADR-08 — Release only tools with distinct value
**Context:** AdSense review and Google's helpful-content signals penalise mass-produced thin pages.
**Decision:** Each new tool must do something useful on its own, with page copy specific to that tool. Ideas without enough substance in a browser-only form (rule-based hashtag generator, SQL fixer/generator, JSON generator) are deferred and documented rather than shipped thin.

## ADR-09 — Ads stay out of tool workspaces
Unchanged from earlier phases: no ad unit inside or directly beside an upload, settings or download area; the same rule applies to every new hub.

## ADR-10 — Link Studio uses the owner's existing Cloudflare Worker through Vercel Functions (supersedes ADR-05)
**Context:** The owner set up the short-link backend (`toolkit4me-shortlinks` Worker + D1 on `go.toolkit4me.com`). The site is a Vite SPA, so there are no Next.js API routes.
**Decision:** Admin calls go browser → Vercel Functions (`api/link-studio/*`, same Vercel project) → Worker. The functions hold `ADMIN_API_KEY`, allow-list every field, and require a GitHub-OAuth admin session. Public visitors get browser-only URL tools; short-link creation is admin-only. Details: `LINK_STUDIO.md`.

## ADR-11 — Calculators are lightweight listings with lazily loaded content
**Context:** Every page loads the tool registry. Adding 30 calculators as full `ToolDefinition`s (page copy inline) would have added roughly 100 KB of JavaScript to every page.
**Decision:** Introduce `ToolListing` — the few fields discovery UI needs (name, description, icon, hub, path, keywords). Every `ToolDefinition` already is one; calculators are listings in `src/data/calculators/catalog.ts` with path `/calculators/<slug>`. Their formulas and page copy live in five group modules loaded only on calculator pages. Cards, hub menus, search, the directory, the homepage and sitemaps read listings; tool pages are unchanged.
**Consequences:** Shared JavaScript didn't grow (≈457 KB after Release 3 vs 466 KB after Release 4). Future large catalogues can follow the same pattern.
