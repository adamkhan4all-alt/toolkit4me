# Release 6 — Batch 1: audit of the "missing features" brief

Date: 2026-11-13. Evidence: code in this repo (`main` @ `2240433`), the Worker source at `C:\Users\Lenovo\toolkit4me-shortlinks-worker` (v1.0.0, not under version control), live checks of www.toolkit4me.com and go.toolkit4me.com, and a scripted browser inspection of phototranslator.net. Nothing has been changed yet.

Status key: ✅ fully working · 🟡 partial · 🔧 built but blocked by configuration · ⬜ not implemented · ⛔ blocked (licence/technical)

## 1. Feature completion matrix

### Link Studio (go.toolkit4me.com)

| Feature | Status | Evidence / gap |
|---|---|---|
| Worker + D1 (create, redirect, list, get, update, delete, analytics) | ✅ live | `/health` ok (DB latency 124 ms). Routes as in the brief; zod-validated, rate-limited. |
| Admin console `/link-studio/admin` (create, search/filter/sort/paginate, edit destination, disable/re-activate, delete, analytics) | 🔧 | Code complete and e2e-tested against a local Worker in Release 4. **Live: `auth/session` → `configured:false`, admin API → 503.** The GitHub OAuth App and 4 env vars were never added, so **no one can create or manage links in production today.** |
| Admin authentication (server-side `ADMIN_API_KEY`, GitHub OAuth, signed HttpOnly session, allow-list) | ✅ code · 🔧 config | Key only in `api/_lib/upstream.ts`; not `VITE_`-prefixed; never in the bundle. |
| Shortener: validation, random codes, redirect, copy, open, destination, created date, clicks, status | ✅ in console (🔧 live) | `CreateLinkForm`, `ShortLinkResult`, `LinksManager`. |
| Custom alias (charset/length, duplicates, reserved names, edit destination) | ✅ in console (🔧 live) | Worker: 3–64 `[A-Za-z0-9_-]`, reserved list, atomic insert-if-absent. |
| Branded short URLs on go.toolkit4me.com | ✅ | `SHORT_URL_BASE`. |
| QR for short links | 🟡 | PNG only, fixed 512 px, fixed margin. **Missing: SVG download, size and margin options.** |
| QR for any URL (public QR Code Generator) | 🟡 | PNG (256/512/1024) + SVG, colours, error correction. **Missing: margin option.** |
| Expiry (none / date-time), server-side | ✅ | Worker compares `expires_at` at redirect time → 410 page. |
| Expired / disabled / missing link pages | 🟡 | Server-side 410/404 with a minimal HTML page. **Not Toolkit4Me-branded** (plain system styling). |
| Disable / re-activate | ✅ in console (🔧 live) | `is_active`, 410 when disabled. |
| **One-time links (atomic redemption)** | ⬜ | No schema or code. Needs a D1 migration + Worker change. |
| Click analytics (total, by date, referrer domain, country, device, per link, summary) | ✅ in console (🔧 live) | No IP/UA stored; ~60 s best-effort dedupe; UI already says counts are filtered estimates. **Missing: no separate "estimated unique" figure** — only total counted clicks (accurate wording already used). |
| **Bulk shortener (API + UI + CSV)** | ⬜ | No bulk endpoint; browser must not fire hundreds of requests. Needs a Worker endpoint. |

### Public URL utilities

| Feature | Status | Route |
|---|---|---|
| URL Validator | ✅ | `/tools/url-validator` |
| URL Encoder / Decoder | ✅ | `/tools/url-encoder-decoder` |
| UTM Builder (keeps existing params and fragments, required-field checks) | ✅ | `/tools/utm-builder` |
| URL Parser & Cleaner (parts, decoded params, tracking removal with explanation) | ✅ | `/tools/url-parser-cleaner` |
| URL tools directory | ✅ | `/link-studio` hub (lists all URL tools + QR) |
| Brief's suggested paths `/url-tools`, `/url-validator`, … | ⬜ | Don't exist. Creating second pages would duplicate indexed pages — see decision D11. |

### Pixel Playground

| Feature | Status | Evidence / gap |
|---|---|---|
| WhatsApp Sticker Maker | 🟡 | `/tools/whatsapp-sticker-maker`: 512 × 512, 16 px margin, transparent WebP (PNG fallback on Safari), plain-background removal, outline, honest import instructions. **Missing: crop/zoom/position, text.** |
| Picture Avatar | ⬜ | Nearest existing tool is Profile Picture Border (circular frame). No style options. |
| Picture to Anime | ⛔ / ⬜ | No commercially licensed anime model identified (see §3). Existing "Photo to Sketch" is a labelled filter. |

## 2. Third-party and external-link audit

### phototranslator.net (reference)

| Question | Finding (browser inspection, 2026-11-13) |
|---|---|
| Links | 36 links, all internal; the only external link is a `mailto:`. Tool pages open on the same site. |
| Third parties | Google AdSense (ad iframes on `googleads.g.doubleclick.net`), Funding Choices consent, reCAPTCHA (ad-fraud frame), Google Fonts. |
| The tool itself | The site's own script calls its own back end: `/ocr-translate`, `/deepl/translate-image-progress/<job>`, `/translate-text`, `/languages`. The endpoint names suggest a DeepL-backed server-side translation (inference from naming; not confirmed). The page says "Online translation service" and that processing time "varies with … service availability". |
| Gemini | **No "Gemini" text or code in the page or its scripts.** The ad frames contained ordinary advertiser creatives (at the time of the check: "WPS Compress PDF — DOWNLOAD", linking via `googleadservices.com`). A Gemini-labelled "text extraction tool" box is therefore most likely an **AdSense ad creative** (Google advertises Gemini through AdSense; creatives rotate, so it couldn't be reproduced on demand) — or the browser's own Gemini button. It is not part of the translator, and the translator doesn't depend on Gemini. |

### Toolkit4Me

Verified in Release 5 (browser QA over all 157 URLs, desktop + mobile) and re-checked in code:

| Area | Destination | External service | Expected? |
|---|---|---|---|
| Every tool card, hub menu item, search result, CTA, recommendation card | Internal `/tools/…`, `/calculators/…`, hub pages, same tab | — | ✅ |
| 35 browser tools + 30 calculators + Link Studio tools | Process in the browser | — | ✅ |
| 11 server tools | `api.toolkit4me.com` (own AWS server); disclosed on each page before upload | AWS hosting | ✅ |
| Short links | `go.toolkit4me.com/<code>` → owner-chosen destination | Cloudflare | ✅ by design |
| Ads | AdSense, labelled, never inside tool workspaces | Google | ✅ |
| External links in content | References only; new tab + `noopener noreferrer`, announced to screen readers | various | ✅ (QA: 0 violations) |
| AI services (Gemini, ChatGPT, OpenAI, …) | **none in the codebase** | — | ✅ |
| Buttons do what they say | Covered by the routing test (every tool renders its action) and Release 2–5 e2e suites | — | ✅ |

No correction is required. New tools in this release must keep the same rules.

## 3. Picture to Anime — licensing finding

- AnimeGAN-family pretrained weights (TachibanaYoshino) are published for **non-commercial use only**; commercial use needs written permission (e.g. AnimeGANv2_Shinkai model card).
- `bryandlee/animegan2-pytorch`: code is MIT, but no licence is stated for the weights, which were trained partly on CelebA-HQ (research-use terms).
- No permissively licensed, good-quality photo-to-anime model with a browser runtime was identified. Toolkit4Me shows ads, so it is commercial use.

A genuine AI anime transform therefore can't ship without either a commercial licence from a model author or a model trained on licensed data.

## 4. Plan (after the decisions in §5)

| Batch | Work | Infrastructure touched |
|---|---|---|
| 2 Link Studio core | Branded expired/disabled/missing/used pages; QR for short links with PNG + SVG, size and margin; margin option in the public QR tool; "estimated unique" wording/metric | Worker (HTML templates only) |
| 3 Advanced | **One-time links**: migration `0003` adds `link_type`/`max_uses`-style columns (additive `ALTER TABLE … ADD COLUMN`); redemption is a single conditional `UPDATE … WHERE redeemed_at IS NULL … RETURNING`, so concurrent requests can't both succeed; GET shows an interstitial "Continue" page and only the button's POST redeems, so link-preview bots and prefetchers can't burn the link. **Bulk**: `POST /api/links/bulk` (≤ 50 URLs, per-item validation, one D1 batch, counts against the create rate limit), a Vercel Function, a console tab with results table and CSV. Worker unit + integration tests (Miniflare), including concurrent redemption. | Worker + D1 migration (additive) |
| 4 URL utilities | Already complete; only routing per D11 | — |
| 5 Pixel Playground | Sticker Maker: crop/zoom/position + text. Picture Avatar and Picture to Anime per D7/D8. | — |
| 6 SEO/privacy | Registry, sitemap, metadata; Privacy Policy (one-time links, bulk), Disclaimer (new tools) | — |
| 7 QA | Full suite, local Worker e2e (`wrangler dev --local`, local D1, throwaway key), site regression | — |
| 8 Deploy | D1 backup export → remote migration → `wrangler deploy` (same Worker) → Vercel via `main` | Existing Worker, D1, Vercel only |

## 5. Decisions needed

- **D7 Picture to Anime** — (a) ship a clearly labelled, non-AI "anime-style cartoon effect" (edge-preserving smoothing, colour banding, ink outlines), named and described as an effect; (b) owner obtains a commercial licence for a model, then it's integrated in-browser; (c) don't ship.
- **D8 Picture Avatar** — build as a non-AI avatar maker: square/circle crop with zoom/position, background colour/gradient, style presets (professional = clean crop + neutral backdrop; cartoon = the effect from D7a; creative/social = colour treatments and rings), sizes 256–1024. Described accurately as crop + effects.
- **D9 Admin sign-in** — owner creates the GitHub OAuth App and adds 4 Vercel env vars (`docs/LINK_STUDIO.md` §6). Until then every admin feature, old and new, is unusable in production.
- **D10 Worker + D1 changes** — approve an additive migration on the production D1 and a redeploy of the existing Worker for one-time links and bulk shortening.
- **D11 Routes** — keep the existing indexed pages (`/link-studio`, `/tools/<slug>`) and add permanent redirects from the brief's short paths (`/url-tools`, `/url-validator`, `/qr-code-generator`, …) instead of duplicate pages; the shortener and bulk shortener live in the admin console because creation is admin-only.

## 6. Owner decisions (2026-11-13)

- **D7** Picture to Anime → ship a clearly labelled, non-AI anime-style cartoon effect; never described as AI.
- **D8** Picture Avatar → non-AI avatar maker (crop, position, backgrounds, style presets), described as crop + effects.
- **D9** Admin sign-in → owner action, outstanding (`docs/LINK_STUDIO.md` §6).
- **D10** Worker + D1 → approved: additive migration and redeploy of the existing Worker, after a D1 backup and passing tests.
- **D11** Routes → keep existing pages; permanent redirects from the brief's short paths; shortener and bulk shortener in the admin console.

## 7. Completion report (2026-11-13)

| Requested feature | Status |
|---|---|
| Short links, custom alias, branded go.toolkit4me.com, expiry, disable/re-activate, analytics | ✅ completed and tested (existed; verified end-to-end) · 🔧 live use needs admin sign-in (D9) |
| QR for original / short / alias URLs: preview, PNG + SVG, size, margin | ✅ completed and tested (QR decoded back to the link in the test) |
| Branded expired / disabled / missing / used pages | ✅ completed and tested (server-side) |
| One-time links (atomic redemption) | ✅ completed and tested — 10- and 25-way races, exactly one success · 🔧 creation needs admin sign-in |
| Bulk shortener (one controlled request, per-row errors, CSV) | ✅ completed and tested · 🔧 needs admin sign-in |
| Analytics wording (total clicks vs unique visitors) | ✅ |
| URL Validator, Encoder/Decoder, UTM Builder, Parser/Cleaner, URL tools directory | ✅ (existed; re-verified) |
| Brief's short paths | ✅ 308 redirects to the existing pages (D11) |
| WhatsApp Sticker Maker: crop/position, caption, transparent 512×512 WebP | ✅ completed and tested |
| Picture Avatar | ✅ completed and tested as a non-AI avatar maker (D8) |
| Picture to Anime | 🟡 shipped as a labelled, non-AI anime-style effect (D7) · ⛔ AI version blocked: no commercially licensed model |
| phototranslator.net / Gemini audit; Toolkit4Me link audit | ✅ §2 — no correction needed |

### Infrastructure

| Item | Result |
|---|---|
| D1 backup before migration | `backups/d1-before-0003-20261113T114050Z.sql` in the Worker folder (git-ignored); production held no links yet |
| Migration 0003 (remote) | ✅ applied; `one_time` (default 0), `redeemed_at` (default NULL) verified |
| Worker | `toolkit4me-shortlinks` v1.1.0, version `da5994d7-76ce-4376-b065-aec396253e88`; same name, D1, domain, cron; Worker source now under git (`1af11b6`, `9d704bc`) |
| Site | merged to `main` as `dcba56e`; Vercel `project-587l0-hd1r77pn8` Ready; Hobby plan; no new project |
| New infrastructure / paid services | none |

### Verification

| Check | Result |
|---|---|
| Worker suite (Miniflare, local D1) | 167 / 167 (147 + 20 new) |
| Site unit/integration | 560 / 560 (525 + 35 new) |
| Local end-to-end, Link Studio (site + real functions → local Worker) | 44 / 44 |
| Pixel tools (local and live) | 18 / 18 each |
| Live Worker | health v1.1.0; branded 404; API and bulk 401 without key |
| Live site | 12 redirects 308; `seo:validate --live` 153 URLs OK; 202 page loads, 0 failures |

### Owner actions outstanding

1. **Admin sign-in (D9)** — GitHub OAuth App + 4 Vercel env vars (`docs/LINK_STUDIO.md` §6). Until then no link can be created or managed in production; a live admin smoke test (create → QR → one-time → bulk → analytics) should follow.
2. A commercial licence for an anime model, if a true AI version is wanted later.
