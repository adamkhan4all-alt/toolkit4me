// ---------------------------------------------------------------------
// Browser test: GA4 consent gating and page-view counting (src/lib/analytics.ts)
// against the REAL Google tag for the configured Measurement ID.
//
// Nothing reaches Google Analytics: gtag.js is downloaded (so the real
// property configuration is exercised) but every collect request and every
// other Google request is answered locally with 204 and never forwarded.
// Google's consent message only runs on toolkit4me.com, so a fake IAB TCF
// __tcfapi stands in for it; /api/consent-region is answered by the test.
//
// Usage (no project dependency is added):
//   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX npx vite build
//   GA_ID=G-XXXXXXXXXX PLAYWRIGHT_CORE=/path/to/node_modules/playwright-core \
//     node scripts/e2e/ga4-consent.mjs
// Optional: E2E_BROWSER_CHANNEL (default "msedge"; e.g. "chrome").
// ---------------------------------------------------------------------

import { createServer } from "node:http";
import { readFile, readdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const GA_ID = process.env.GA_ID ?? "";
if (!/^G-[A-Z0-9]{10}$/.test(GA_ID)) throw new Error("Set GA_ID to the Measurement ID the build was made with (G- + 10 characters).");
const DIST = resolve(process.env.DIST_DIR ?? "dist");
const PORT = Number(process.env.E2E_PORT ?? 5193);
const SITE = `http://localhost:${PORT}`;

const pw = await import(process.env.PLAYWRIGHT_CORE ? pathToFileURL(join(process.env.PLAYWRIGHT_CORE, "index.mjs")).href : "playwright-core");
const { chromium } = pw.default ?? pw;

// The build under test must carry the expected ID.
const assets = await readdir(join(DIST, "assets"));
let idInBuild = false;
for (const f of assets.filter((a) => a.endsWith(".js"))) if ((await readFile(join(DIST, "assets", f), "utf8")).includes(GA_ID)) idInBuild = true;
if (!idInBuild) throw new Error(`${GA_ID} is not in ${DIST}; build with VITE_GA_MEASUREMENT_ID=${GA_ID}.`);

// Static server: prerendered pages, then the SPA shell.
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json", ".woff2": "font/woff2", ".txt": "text/plain", ".xml": "application/xml" };
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, SITE).pathname);
  for (const f of [join(DIST, path), join(DIST, path, "index.html"), join(DIST, "index.html")]) {
    try {
      const body = await readFile(f);
      res.writeHead(200, { "Content-Type": TYPES[extname(f)] ?? "application/octet-stream" });
      return res.end(body);
    } catch {
      // try the next candidate
    }
  }
  res.writeHead(404);
  res.end();
});
await new Promise((r) => server.listen(PORT, "localhost", r));

const results = [];
const check = (name, ok, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"} — ${name}${detail ? `\n       ${detail}` : ""}`);
};
const browser = await chromium.launch({ channel: process.env.E2E_BROWSER_CHANNEL ?? "msedge" });

/**
 * region: true | false | "fail" — the /api/consent-region answer.
 * cmp: "none" | "eea" — no consent message at all, or a fake one that starts with the banner on screen.
 */
async function session({ region, cmp, blockGa = false }) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.route(/googlesyndication|fundingchoices|doubleclick/, (r) => r.abort());
  const net = { gtagJs: 0, otherGoogle: 0, region: 0 };
  await ctx.route(/\/api\/consent-region$/, (r) => {
    net.region++;
    if (region === "fail") return r.fulfill({ status: 500, body: "" });
    return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ consentRequired: region }) });
  });
  const hits = [];
  await ctx.route(/^https:\/\/([a-z0-9.-]+\.)?(google|googletagmanager|google-analytics|googleadservices)\.[a-z.]+\//, (r) => {
    const url = r.request().url();
    if (/googletagmanager\.com\/gtag\/js/.test(url)) {
      net.gtagJs++;
      return blockGa ? r.abort() : r.continue();
    }
    if (/\/g\/collect/.test(url)) {
      const u = new URL(url);
      const body = r.request().postData() ?? "";
      for (const line of body ? body.split("\n") : [""]) {
        // Batched requests: shared parameters in the URL, per-event overrides on each body line.
        const p = new URLSearchParams(u.search.slice(1));
        for (const [k, v] of new URLSearchParams(line)) p.set(k, v);
        if (p.get("en")) hits.push({ en: p.get("en"), dl: (p.get("dl") ?? "").replace(SITE, ""), dt: (p.get("dt") ?? "").split(/ [–—|] /)[0], raw: `${u.search} ${line}` });
      }
    } else net.otherGoogle++;
    return r.fulfill({ status: 204, body: "" });
  });
  await ctx.addInitScript((mode) => {
    if (mode !== "eea") return;
    const listeners = [];
    window.__state = { gdprApplies: true, eventStatus: "cmpuishown", purpose: { consents: {} }, vendor: { consents: {} } };
    window.__tcfapi = (cmd, _v, cb) => {
      if (cmd === "addEventListener") {
        listeners.push(cb);
        cb(window.__state, true);
      }
    };
    window.__setConsent = (yes) => {
      window.__state = { gdprApplies: true, eventStatus: "useractioncomplete", purpose: { consents: { 1: yes } }, vendor: { consents: { 755: yes } } };
      for (const l of listeners) l(window.__state, true);
    };
    window.googlefc = { callbackQueue: [], showRevocationMessage: () => (window.__revocationShown = true) };
    setInterval(() => {
      const q = window.googlefc.callbackQueue;
      while (q.length) q.shift()();
    }, 50);
  }, cmp);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  return { ctx, page, hits, net, errors, gaCookies: async () => (await ctx.cookies()).filter((c) => c.name.startsWith("_ga")).map((c) => c.name) };
}
const settle = (p, ms = 2500) => p.waitForTimeout(ms);
const nav = (page, href) => page.evaluate((h) => document.querySelector(`a[href="${h}"]`).click(), href);
/** The tag batches hits; wait, then leave the page so everything queued is sent. */
const flush = async (s) => {
  await settle(s.page, 8000);
  await s.page.goto("about:blank");
  await settle(s.page, 3000);
};
const views = (s) => s.hits.filter((h) => h.en === "page_view");
const fmt = (vs) => vs.map((v) => `${v.dl} "${v.dt}"`).join("  →  ");
const SENSITIVE = /[?&](q|email|search|s)=|secret|probe|%40/;

// 1. Outside the consent area: first page, navigation, back/forward, clean URLs, titles, no duplicates.
{
  const s = await session({ region: false, cmp: "none" });
  await s.page.goto(`${SITE}/tools?q=secret&email=probe%40example.invalid&utm_source=newsletter`);
  await settle(s.page, 3500);
  await nav(s.page, "/tools/compress-image");
  await settle(s.page);
  await nav(s.page, "/privacy");
  await settle(s.page);
  await s.page.goBack();
  await settle(s.page);
  await s.page.goForward();
  await settle(s.page);
  await flush(s);
  const v = views(s);
  check("first page: exactly one page_view (the tag's automatic one) with clean URL and real title",
    v[0]?.dl === "/tools?utm_source=newsletter" && /All Tools/.test(v[0]?.dt) && v.filter((x) => x.dl.startsWith("/tools?")).length === 1, fmt(v.slice(0, 1)));
  check("SPA navigation: exactly one page_view per route, with the new page's title",
    v[1]?.dl === "/tools/compress-image" && /Compress/.test(v[1]?.dt) && v[2]?.dl === "/privacy" && /Privacy/.test(v[2]?.dt));
  check("back and forward: exactly one page_view each", v[3]?.dl === "/tools/compress-image" && v[4]?.dl === "/privacy");
  check("exactly one page_view per page display (5 for 5)", v.length === 5, fmt(v));
  check("no search query, email or other query string in any hit (utm_* kept)", s.hits.every((h) => !SENSITIVE.test(h.raw)), [...new Set(s.hits.map((h) => h.dl))].join(", "));
  check("gtag.js loaded once; no requests to other Google endpoints", s.net.gtagJs === 1 && s.net.otherGoogle === 0, JSON.stringify(s.net));
  check("no page errors", s.errors.length === 0, s.errors.join(" | "));
  await s.ctx.close();
}

// 2. Consent area: before consent, acceptance, withdrawal (footer link), re-consent.
{
  const s = await session({ region: true, cmp: "eea" });
  await s.page.goto(`${SITE}/tools?q=secret`);
  await settle(s.page, 3500);
  await nav(s.page, "/about");
  await settle(s.page);
  check("before consent: no gtag.js, no hits, no _ga cookies", s.net.gtagJs === 0 && s.hits.length === 0 && (await s.gaCookies()).length === 0);

  await s.page.evaluate(() => window.__setConsent(true));
  await settle(s.page, 3000);
  const cookiesAfterConsent = await s.gaCookies();
  await nav(s.page, "/privacy");
  await settle(s.page);

  await s.page.locator("footer").getByRole("link", { name: "Privacy & cookie settings" }).click();
  await settle(s.page, 400);
  const reopened = (await s.page.evaluate(() => window.__revocationShown === true)) && new URL(s.page.url()).pathname === "/privacy";
  await s.page.evaluate(() => window.__setConsent(false));
  await settle(s.page, 1000);
  const afterWithdraw = {
    cookies: (await s.gaCookies()).length,
    disabled: await s.page.evaluate((id) => window[`ga-disable-${id}`] === true, GA_ID),
    consent: await s.page.evaluate(() => (window.dataLayer ?? []).map((a) => Array.from(a)).filter((a) => a[0] === "consent").at(-1)),
  };
  await nav(s.page, "/blog");
  await settle(s.page, 8000); // long enough for anything queued to be sent
  const blogWhileWithdrawn = views(s).filter((x) => x.dl === "/blog").length;

  await s.page.evaluate(() => window.__setConsent(true));
  await settle(s.page, 3000);
  await nav(s.page, "/contact");
  await settle(s.page);
  await flush(s);
  const v = views(s);
  check("consent accepted: exactly one page_view for the page on screen (the tag's), clean URL and title; _ga cookies set",
    v[0]?.dl === "/about" && /About/.test(v[0]?.dt) && v.filter((x) => x.dl === "/about").length === 1 && cookiesAfterConsent.length >= 1, `${fmt(v.slice(0, 1))}; cookies ${cookiesAfterConsent.join(",")}`);
  check("navigation after consent: exactly one page_view", v[1]?.dl === "/privacy" && v.filter((x) => x.dl === "/privacy").length === 1);
  check("footer 'Privacy & cookie settings' re-opens Google's consent message", reopened);
  check("withdrawal: analytics_storage denied, ga-disable set, _ga cookies deleted",
    afterWithdraw.consent?.[2]?.analytics_storage === "denied" && afterWithdraw.disabled && afterWithdraw.cookies === 0, JSON.stringify(afterWithdraw));
  check("withdrawn: navigating sends nothing", blogWhileWithdrawn === 0);
  check("re-consent: exactly one page_view for the page on screen, without reloading the tag", v.filter((x) => x.dl === "/blog").length === 1 && v[2]?.dl === "/blog" && s.net.gtagJs === 1, JSON.stringify(s.net));
  check("then one per navigation: 4 page_views for 4 consented page displays", v[3]?.dl === "/contact" && v.length === 4, fmt(v));
  check("no sensitive query data in any hit", s.hits.every((h) => !SENSITIVE.test(h.raw)));
  check("no page errors", s.errors.length === 0, s.errors.join(" | "));
  await s.ctx.close();
}

// 3. Consent area without the consent message (blocked or failed): nothing, ever.
{
  const s = await session({ region: true, cmp: "none" });
  await s.page.goto(`${SITE}/`);
  await settle(s.page, 11500);
  await flush(s);
  check("consent area without the consent message: no gtag.js, no hits, no cookies", s.net.gtagJs === 0 && s.hits.length === 0 && (await s.gaCookies()).length === 0);
  await s.ctx.close();
}

// 4. Region check fails and there is no consent message: treated as consent-required.
{
  const s = await session({ region: "fail", cmp: "none" });
  await s.page.goto(`${SITE}/`);
  await settle(s.page, 11500);
  await flush(s);
  check("failed region check: treated as consent-required, nothing loads", s.net.region === 1 && s.net.gtagJs === 0 && s.hits.length === 0);
  await s.ctx.close();
}

// 5. Outside the area but shown the message (e.g. VPN) and refuses: respected.
{
  const s = await session({ region: false, cmp: "eea" });
  await s.page.goto(`${SITE}/`);
  await settle(s.page, 3000);
  await s.page.evaluate(() => window.__setConsent(false));
  await settle(s.page, 1000);
  const disabled = await s.page.evaluate((id) => window[`ga-disable-${id}`] === true, GA_ID);
  check("outside the area, refusal in the message is honoured (ga-disable set, cookies removed)", disabled && (await s.gaCookies()).length === 0);
  await s.ctx.close();
}

// 6. Analytics blocked by an extension: the site keeps working.
{
  const s = await session({ region: false, cmp: "none", blockGa: true });
  await s.page.goto(`${SITE}/tools/word-counter`);
  await settle(s.page);
  await s.page.locator("textarea").first().fill("one two three four");
  const counted = await s.page.getByText(/\b4\b/).first().isVisible().catch(() => false);
  await nav(s.page, "/tools");
  await settle(s.page, 1500);
  check("Analytics blocked: tools and navigation work, no page errors", counted && /All Tools/.test(await s.page.title()) && s.errors.length === 0, s.errors.join(" | "));
  await s.ctx.close();
}

await browser.close();
server.close();
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
