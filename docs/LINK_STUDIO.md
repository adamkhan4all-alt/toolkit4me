# Link Studio — Release 4

Implementation, API integration, security review, testing and deployment for Link Studio on toolkit4me.com. Status key: ✅ done · 🟡 partial · ⏸ deferred · 🔒 blocked · 🔧 needs manual configuration.

## 1. Summary

| Part | Status |
|---|---|
| Public hub `/link-studio` (hub page, intro, tool table, short-link explainer, analytics disclosure, FAQ + FAQPage JSON-LD, sitemap `sitemap-link-studio.xml`) | ✅ |
| Browser URL tools: UTM Builder, URL Parser & Cleaner, URL Validator, URL Encoder & Decoder (+ existing QR Code Generator listed) | ✅ |
| Server-side integration with the existing Worker (Vercel Functions in `api/`, same Vercel project, no new infrastructure) | ✅ |
| Admin console `/link-studio/admin`: create, list/search/filter/sort/paginate, edit, disable/re-activate, delete, analytics | ✅ |
| Admin authentication: GitHub OAuth (PKCE + state), allow-list of GitHub user ids, signed HttpOnly session | ✅ code · 🔧 needs 4 env vars + a GitHub OAuth App (§6) |
| Privacy Policy: short-link analytics disclosure, Cloudflare and GitHub as providers | ✅ |
| One-time links, bulk shortener | ✅ Release 6 — Worker v1.1.0 (migration 0003), `api/link-studio/links/bulk.ts`, console Bulk tab; see `docs/RELEASE_6_AUDIT.md` |
| QR for short links: PNG + SVG, size, margin; branded expired / disabled / used / missing pages | ✅ Release 6 |
| Public (non-admin) short-link creation | ⏸ out of scope by decision — admin-only |

Nothing was changed in the Cloudflare Worker, D1 database, DNS, AWS backend or Vercel plan. No new runtime dependency was added (the functions use Web Crypto and `fetch`; the UI reuses `qrcode`, already a dependency).

## 2. Architecture

```
Browser ──(same-origin fetch, HttpOnly ls_session cookie)──► /api/link-studio/*  (Vercel Functions, Node runtime)
                                                               │  1. verify signed session + GitHub-id allow-list
                                                               │  2. same-origin check on POST/PUT/DELETE
                                                               │  3. validate + allow-list every field / query param
                                                               ▼
                                                 https://go.toolkit4me.com/api/*   (existing Worker toolkit4me-shortlinks)
                                                 Authorization: Bearer $ADMIN_API_KEY   (server-side only)
                                                               ▼
                                                 D1 toolkit4me-shortlinks-db
```

The site is a Vite + React SPA (not Next.js), so "Next.js API routes" from the brief are implemented as Vercel Functions in the `api/` folder of the same project — the Vercel equivalent for non-Next projects. They deploy with the site; Hobby plan, no extra project.

### Routes

| Route | Purpose | Indexed |
|---|---|---|
| `/link-studio` | Public hub (hub page from `src/data/hubs.ts`) | yes, in `sitemap-link-studio.xml` |
| `/tools/utm-builder`, `/tools/url-parser-cleaner`, `/tools/url-validator`, `/tools/url-encoder-decoder` | Public browser tools (`src/data/linkTools.ts`) | yes |
| `/link-studio/admin` | Team console (lazy-loaded chunk, ~11 KB gzip) | no — `noindex` meta + `X-Robots-Tag`, not in any sitemap |

### Functions (`api/`)

| File | Endpoints | Worker endpoint called |
|---|---|---|
| `api/link-studio/auth/[action].ts` | `GET login`, `GET callback`, `GET session`, `POST logout` | — (GitHub) |
| `api/link-studio/links/index.ts` | `GET` list, `POST` create | `GET/POST /api/links` |
| `api/link-studio/links/[code].ts` | `GET`, `PUT`, `DELETE` | `GET/PUT/DELETE /api/links/:code` |
| `api/link-studio/analytics.ts` | `GET ?days=&code=` | `GET /api/analytics/summary` or `/api/analytics/:code` |

Shared logic lives in `api/_lib/` (underscore = not a route): `config.ts`, `crypto.ts`, `session.ts`, `auth.ts`, `links.ts`, `upstream.ts`, `http.ts`.

### Environment variables (Vercel → project-587l0 → Settings → Environment Variables, Production)

| Name | Status | Purpose |
|---|---|---|
| `ADMIN_API_KEY` | ✅ exists | Worker bearer key. Server-only. |
| `LINK_STUDIO_GITHUB_CLIENT_ID` | 🔧 add | GitHub OAuth App client id |
| `LINK_STUDIO_GITHUB_CLIENT_SECRET` | 🔧 add (Sensitive) | GitHub OAuth App client secret |
| `LINK_STUDIO_SESSION_SECRET` | 🔧 add (Sensitive) | ≥ 32 random characters; signs session cookies. Rotating it signs everyone out. |
| `LINK_STUDIO_ADMIN_GITHUB_IDS` | 🔧 add | Comma-separated **numeric** GitHub user ids allowed to administer |
| `LINK_STUDIO_API_URL` | optional | Defaults to `https://go.toolkit4me.com`; only set for testing against another Worker |
| `LINK_STUDIO_SITE_ORIGIN` | optional | Defaults to `https://www.toolkit4me.com`; only for local testing |

None of these is prefixed `VITE_`, so Vite never puts them in the browser bundle.

## 3. API integration (verified against the Worker source, `toolkit4me-shortlinks` v1.0.0)

- Envelope `{ ok, data }` / `{ ok:false, error:{ code, message, details?, requestId? } }` — the functions pass `code`, `message` and sanitised `details` through, never `requestId` internals or 5xx messages.
- Create: `url` (required), `alias` (3–64, `[A-Za-z0-9_-]`, alphanumeric ends, case-sensitive, reserved words blocked), `expiresAt` (ISO with offset, future, ≤ 10 years), `redirectType` (301/302/307/308, default 302), `isActive`. Unknown fields rejected (the Worker's schemas are `.strict()`; the functions mirror that).
- Update: `url`, `expiresAt` (null clears), `isActive`, `redirectType`. The code can't change.
- List: `page`, `limit` (1–100; UI uses 20), `search` (≤ 100), `status` (`all|active|inactive|expired`), `sort` (`created_at|clicks|last_clicked_at|expires_at`), `order`.
- Analytics: `days` 1–365. Summary: totals, zero-filled `daily`, `topLinks`, `referrers`, `countries`, `devices`. Per link: `link`, totals, `daily`, breakdowns.
- Redirects: active → configured status; expired/disabled → 410; unknown → 404; HEAD and bots not counted; repeat clicks within ~60 s suppressed best-effort; 301/308 cached for 1 h (repeat clicks may not be counted — the UI says so).
- `X-Client-Id: admin-gh-<github id>` is sent so the Worker's per-client rate limits apply per admin rather than to Vercel's shared egress IP.
- Worker 401/403 (wrong key) → `502 link_service_auth` with a generic message; Worker 5xx / network failure / non-JSON → `502`; 10 s timeout.

## 4. Security review

| Requirement | How it's met | Tested by |
|---|---|---|
| Key never reaches the browser | Only `api/_lib/upstream.ts` reads `ADMIN_API_KEY`; not `VITE_`-prefixed; never logged; Worker error messages on 401/5xx are replaced | unit: `expectNoSecrets` on every response; build scan: 0 matches of key/var names in `dist/` |
| No unrestricted proxy | Each function calls one fixed Worker path; codes must match `^[A-Za-z0-9_-]{1,64}$` and the exact `/links/<code>` shape (dot-segments → 404); query params and body fields allow-listed | unit: path traversal cases, unknown params dropped, unknown fields 400 |
| Every admin operation authorised | `requireAdmin` on every handler: signed session (HMAC-SHA256, constant-time verify), expiry, **and** GitHub id re-checked against the allow-list on each request | unit: missing / tampered / expired / wrong-secret / non-allow-listed sessions → 401 on all 5 admin operations; e2e: same in a browser |
| Fails closed | Missing auth config → 503 on admin API (`admin_not_configured`); missing key → 503 | unit |
| CSRF | Session cookie `SameSite=Strict`, `Path=/api/link-studio`; POST/PUT/DELETE/logout require `Origin` = site origin; JSON content type required | unit: no/foreign Origin → 403, text/plain → 415 |
| OAuth | Authorization code + PKCE (S256) + random `state` in a signed, 10-minute, `HttpOnly; SameSite=Lax` cookie compared in constant time; GitHub token used once and discarded; `allow_signup=false`; callback URL fixed (never from the Host header) | unit: state mismatch / missing cookie / denied / GitHub failure / non-allow-listed id |
| Session cookie | `HttpOnly; Secure; SameSite=Strict; Path=/api/link-studio; Max-Age=28800` (8 h) | unit asserts the exact attributes |
| Input validation | Client (instant feedback) + functions (allow-list) + Worker (zod, authoritative) | unit + e2e |
| Response hardening | `Cache-Control: no-store`, `X-Robots-Tag: noindex`, `nosniff`, `X-Frame-Options: DENY`, CSP `default-src 'none'` on all API responses | unit |
| Admin page not discoverable | `noindex` meta + header, not in sitemaps, link marked `nofollow` — but **protection comes from the API checks, not from hiding** | e2e, SEO validator |
| No secrets committed | `.env.production` holds only public `VITE_` config; no new env files | git status review |

Residual risks / notes:
- Sessions are stateless: a stolen cookie works until it expires (8 h) unless the id is removed from the allow-list or the session secret is rotated. Both take effect immediately.
- The Worker's rate limits are per Cloudflare location and approximate (documented in the Worker README).
- Workers Logs (observability) may record request metadata; the Privacy Policy describes Cloudflare's processing without retention claims.

## 5. Testing

| Suite | Result |
|---|---|
| Unit — URL tools (`src/lib/linkTools/__tests__`) | 29 ✅ |
| Unit — API security (`api/_lib/__tests__`) | 20 ✅ |
| Unit — admin form helpers (`src/lib/linkStudio/__tests__`) | 6 ✅ |
| Whole suite | 387 / 387 ✅ (25 files) |
| `tsc -b` (app, node, api) | ✅ |
| `oxlint` | ✅ no new warnings |
| Production build + prerender | ✅ |
| `seo:validate` on `dist/` | ✅ 103 pages, 7 child sitemaps, 101 sitemap URLs, no problems |
| Browser e2e (Playwright, desktop + 375 px) against the **local** Worker (`wrangler dev --local`, local D1, throwaway key) | 96 / 96 ✅ — hub content, all 4 tools, anonymous lockout, forged sessions, create (options, QR, copy), duplicate/reserved aliases, random codes, redirect 307, click counted, search, edit (redirect follows), disable → 410, re-activate, link + summary analytics (range switch, table view), delete → 404, sign-out, pagination (23 links → 20 + 3), status filter, no console errors, no horizontal overflow |
| Full-site regression (every sitemap URL, desktop + mobile) | see §7 |

The production Worker and D1 were not used for any test.

## 6. Admin sign-in setup (owner, ~5 minutes) 🔧

1. GitHub → Settings → Developer settings → **OAuth Apps** → New OAuth App
   - Application name: `Toolkit4Me Link Studio`
   - Homepage URL: `https://www.toolkit4me.com/link-studio`
   - Authorization callback URL: `https://www.toolkit4me.com/api/link-studio/auth/callback`
   - Register, then **Generate a new client secret**.
2. Find your numeric GitHub id: open `https://api.github.com/users/<your-github-username>` and copy the `"id"` number.
3. Vercel → project **project-587l0** → Settings → Environment Variables → add for **Production**:
   `LINK_STUDIO_GITHUB_CLIENT_ID`, `LINK_STUDIO_GITHUB_CLIENT_SECRET` (Sensitive), `LINK_STUDIO_SESSION_SECRET` (Sensitive; generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`), `LINK_STUDIO_ADMIN_GITHUB_IDS` (your id; comma-separate more ids to add team members).
4. Redeploy (Deployments → latest → Redeploy) so the functions pick the variables up.
5. Open `https://www.toolkit4me.com/link-studio/admin` → Sign in with GitHub.

Until step 4 is done the console shows "Not set up yet" and the admin API answers 503 — nothing is exposed.

## 7. Deployment

| Item | Result |
|---|---|
| Commits | `ba2ec49` (Release 4), merged to `main` as `0543330` |
| Vercel | project `project-587l0`, Production deployment `project-587l0-dwimpdb90` — Ready; Hobby plan unchanged; no new project |
| Worker / D1 / DNS | untouched; `go.toolkit4me.com/health` ok |
| Live pages | `/link-studio`, 4 tool pages, `/link-studio/admin`, `sitemap-link-studio.xml`, `/`, `ads.txt`, `robots.txt` → 200 |
| Live API (sign-in not yet configured) | `auth/session` → `{configured:false}`; admin API → 503 `admin_not_configured`; `auth/login` → 303 to `/link-studio/admin?error=not_configured`; `X-Robots-Tag: noindex` + `no-store` present — fails closed as designed |
| `seo:validate --live` | 103 pages, 7 child sitemaps, 101 URLs, every URL live, no problems |
| Live browser checks (desktop + 375 px) | 42 / 42 — hub, 4 tools, admin lockout |
| Pending | 🔧 owner configures GitHub sign-in (§6), then a live admin smoke test: sign in → create → redirect → analytics → delete |

Rollback: Vercel → Deployments → previous production deployment → Promote. The release adds files and a hub; it doesn't change the Worker, the database or other routes, so rollback has no data impact.

---

## 8. Release 7 — public, anonymous URL shortener

**Page:** `/tools/url-shortener` (short path `/url-shortener` redirects there). No sign-in, no account, no GitHub.
The page calls the existing Worker `toolkit4me-shortlinks` on `go.toolkit4me.com` directly
(`POST /api/public/links`, `GET /api/public/status`, `credentials: "include"`); it never sees `ADMIN_API_KEY`.
Same Worker, same D1 database (`toolkit4me-shortlinks-db`, binding `DB`) — nothing new was created.

| Rule | How it's enforced (all server-side, in the Worker) |
|---|---|
| 5 links per visitor per day | Signed `t4m_vid` cookie (HMAC, HttpOnly, Secure, SameSite=Lax, path `/api/public`, 400 days). Forged or tampered cookies count as a new visitor. |
| Daily boundary | UTC calendar day; resets 00:00 UTC. The page shows the reset in the visitor's local time and in UTC. |
| Only successful creations count | Validation and destination checks run before the quota is reserved; a failed insert refunds it. |
| Atomic under concurrency | One D1 batch with conditional `UPDATE … WHERE used < limit`; tested with 10–12 simultaneous requests. |
| IP-based layer | 20 links per address per UTC day, keyed by a daily-rotating HMAC of the IP (no raw IP stored); `RL_PUBLIC` 10 attempts/min. |
| Challenge | Browser proof-of-work (Web Worker, invisible): for new visitors (16 bits, ~50 ms), harder (20 bits, ~1 s) after 3 new identities from one address in a day (cookie clearing) or 10+ links from one address. |
| Unsafe URLs | Only http/https; `javascript:`, `data:` etc. refused; private/loopback addresses and other shorteners refused. |
| Custom aliases, editing, disabling, analytics | Admin-only, unchanged (Worker `ADMIN_API_KEY` via the Vercel admin proxy). Public requests with `alias` get `403 alias_admin_only`. |
| Retention | Quota counters deleted after 2 days; challenges after expiry (daily cron). Public links are tagged `source = 'public'` and visible in the team console with a "Created by → Public" filter. |

**Tests:** Worker 188/188 (21 new public-shortener integration tests). Site 565/565, lint at baseline,
`seo:validate` clean. Local browser acceptance (site → Worker 1.2.0, local D1): 36/36 — first five allowed,
sixth refused (429 with reset time), invalid URLs free, refresh and browser restart keep the count, concurrent
requests capped, cleared cookies get the harder check and the per-address cap, aliases 403, management API 401,
admin console filter, 375 px layout.

**Deploy steps (need owner approval):** D1 backup → `wrangler d1 migrations apply toolkit4me-shortlinks-db --remote`
(migration `0004_public_shortener.sql`, additive only) → `wrangler secret put ANON_SECRET` (new random 32 bytes) →
`wrangler deploy` (v1.2.0) → merge site branch `release-7-public-shortener` and deploy to Vercel.
Rollback: redeploy Worker v1.1.0 (the new column and tables are ignored by it) and promote the previous Vercel deployment.
