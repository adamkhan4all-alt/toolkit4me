// ---------------------------------------------------------------------
// Browser test: calculator page views and calculator events (GA4) on all
// calculator routes, against the REAL Google tag for the configured ID.
//
// Nothing reaches Google Analytics: gtag.js is downloaded, but every
// collect request and every other Google request is answered locally
// (204) and never forwarded.
//
// Usage (no project dependency is added):
//   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX npm run build
//   GA_ID=G-XXXXXXXXXX PLAYWRIGHT_CORE=/path/to/node_modules/playwright-core \
//     node scripts/e2e/calculator-analytics.mjs
// Optional: E2E_BROWSER_CHANNEL (default "msedge"), E2E_PORT (5194).
// ---------------------------------------------------------------------

import { createServer } from "node:http";
import { readFile, readdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const GA_ID = process.env.GA_ID ?? "";
if (!/^G-[A-Z0-9]{10}$/.test(GA_ID)) throw new Error("Set GA_ID to the Measurement ID the build was made with.");
const DIST = resolve(process.env.DIST_DIR ?? "dist");
const PORT = Number(process.env.E2E_PORT ?? 5194);
const SITE = `http://localhost:${PORT}`;
const pw = await import(process.env.PLAYWRIGHT_CORE ? pathToFileURL(join(process.env.PLAYWRIGHT_CORE, "index.mjs")).href : "playwright-core");
const { chromium } = pw.default ?? pw;

let idInBuild = false;
for (const f of (await readdir(join(DIST, "assets"))).filter((a) => a.endsWith(".js"))) if ((await readFile(join(DIST, "assets", f), "utf8")).includes(GA_ID)) idInBuild = true;
if (!idInBuild) throw new Error(`${GA_ID} is not in ${DIST}; build with VITE_GA_MEASUREMENT_ID=${GA_ID}.`);

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json", ".woff2": "font/woff2", ".txt": "text/plain", ".xml": "application/xml" };
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, SITE).pathname);
  for (const f of [join(DIST, path), join(DIST, path, "index.html"), join(DIST, "index.html")]) {
    try {
      const body = await readFile(f);
      res.writeHead(200, { "Content-Type": TYPES[extname(f)] ?? "application/octet-stream" });
      return res.end(body);
    } catch {
      // next candidate
    }
  }
  res.writeHead(404);
  res.end();
});
await new Promise((r) => server.listen(PORT, "localhost", r));

// Routes and expected titles come from the build itself (sitemap + prerendered <title>).
const sitemap = await readFile(join(DIST, "sitemap-calculators.xml"), "utf8");
const ROUTES = [...sitemap.matchAll(/<loc>https:\/\/www\.toolkit4me\.com(\/calculators\/[^<]+)<\/loc>/g)].map((m) => m[1]);
const TITLE = {};
for (const r of ROUTES) TITLE[r] = ((await readFile(join(DIST, r, "index.html"), "utf8")).match(/<title[^>]*>([^<]*)<\/title>/)?.[1] ?? "").replace(/&amp;/g, "&");
const ALLOWED_EVENT_PARAMS = new Set(["ep.calculator_name", "ep.calculator_category", "ep.calculator_type", "ep.trigger", "ep.result_status", "ep.copy_status"]);
const SENTINEL = "987654321";

const results = [];
const check = (name, ok, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"} — ${name}${detail ? `\n       ${detail}` : ""}`);
};
const browser = await chromium.launch({ channel: process.env.E2E_BROWSER_CHANNEL ?? "msedge" });

async function session({ region = false, cmp = "none" } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: SITE });
  await ctx.route(/googlesyndication|fundingchoices|doubleclick/, (r) => r.abort());
  await ctx.route(/\/api\/consent-region$/, (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ consentRequired: region }) }));
  const hits = [];
  await ctx.route(/^https:\/\/([a-z0-9.-]+\.)?(google|googletagmanager|google-analytics|googleadservices)\.[a-z.]+\//, (r) => {
    const url = r.request().url();
    if (/googletagmanager\.com\/gtag\/js/.test(url)) return r.continue();
    if (/\/g\/collect/.test(url)) {
      const u = new URL(url);
      // Batched events: one per body line, CRLF-separated.
      for (const line of (r.request().postData() ?? "").split(/\r?\n/)) {
        const p = new URLSearchParams(u.search.slice(1));
        for (const [k, v] of new URLSearchParams(line)) p.set(k, v);
        if (!p.get("en")) continue;
        const ep = Object.fromEntries([...p].filter(([k]) => k.startsWith("ep.") || k.startsWith("epn.")));
        hits.push({ en: p.get("en"), dl: (p.get("dl") ?? "").replace(SITE, ""), dt: p.get("dt") ?? "", ep, raw: `${u.search}&${line}` });
      }
    }
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
  }, cmp);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  return { ctx, page, hits, errors };
}
const flush = async (s, wait = 8000) => {
  await s.page.waitForTimeout(wait);
  await s.page.goto("about:blank");
  await s.page.waitForTimeout(3000);
};
const views = (s) => s.hits.filter((h) => h.en === "page_view");
const calcEvents = (s) => s.hits.filter((h) => h.en.startsWith("calculator_"));
const short = (t) => t.split(/ [–—|] /)[0];
const pool = async (items, n, fn) => {
  const q = [...items];
  await Promise.all(Array.from({ length: n }, async () => { for (let it; (it = q.shift()); ) await fn(it); }));
};

check(`calculator routes found in the build: ${ROUTES.length}`, ROUTES.length === 30);

// 1. Direct visit to every calculator: one page_view, correct title, clean URL.
{
  const bad = [];
  await pool(ROUTES, 5, async (r) => {
    const s = await session();
    await s.page.goto(`${SITE}${r}?amount=123456&utm_source=audit`);
    await flush(s, 9000);
    const v = views(s);
    if (!(v.length === 1 && v[0].dl === `${r}?utm_source=audit` && v[0].dt === TITLE[r])) bad.push(`${r}: ${v.length} page_view(s), dl=${v[0]?.dl}, dt="${v[0]?.dt ?? ""}"`);
    await s.ctx.close();
  });
  check("direct visits: 30/30 with exactly one page_view, the calculator's own title and a clean URL", bad.length === 0, bad.join("\n       "));
}

// 2. SPA: hub → each calculator → back, in one session.
{
  const s = await session();
  await s.page.goto(`${SITE}/calculators`);
  await s.page.waitForTimeout(5000);
  for (const r of ROUTES) {
    await s.page.evaluate((h) => document.querySelector(`main a[href="${h}"]`).click(), r);
    await s.page.waitForFunction((want) => document.title === want, TITLE[r], { timeout: 15000 }).catch(() => {});
    await s.page.waitForTimeout(1800);
    await s.page.goBack();
    await s.page.waitForFunction(() => document.title.startsWith("Calculator Hub"), null, { timeout: 15000 }).catch(() => {});
    await s.page.waitForTimeout(1800);
  }
  await flush(s);
  const v = views(s);
  const bad = ROUTES.map((r) => ({ r, m: v.filter((h) => h.dl === r) })).filter(({ r, m }) => !(m.length === 1 && m[0].dt === TITLE[r]));
  check("SPA navigation hub → calculator: 30/30 with exactly one page_view and the right title", bad.length === 0,
    bad.map(({ r, m }) => `${r}: ${m.length} page_view(s), dt=${JSON.stringify(m[0]?.dt)} expected=${JSON.stringify(TITLE[r])}`).join("\n       "));
  check("hub counted once per display (first load + 30 returns)", v.filter((h) => h.dl === "/calculators").length === 31, `${v.filter((h) => h.dl === "/calculators").length}`);
  check("no duplicate page views overall (61 for 61 displays)", v.length === 61, `${v.length}`);
  await s.ctx.close();
}

// 3. Back / forward between calculators.
{
  const s = await session();
  await s.page.goto(`${SITE}/calculators`);
  await s.page.waitForTimeout(4000);
  const go = async (fn, want) => { await fn(); await s.page.waitForFunction((w) => document.title === w, want, { timeout: 15000 }).catch(() => {}); await s.page.waitForTimeout(1800); };
  await go(() => s.page.evaluate(() => document.querySelector('main a[href="/calculators/tip-calculator"]').click()), TITLE["/calculators/tip-calculator"]);
  await go(() => s.page.evaluate(() => document.querySelector('main a[href="/calculators/discount-calculator"]').click()), TITLE["/calculators/discount-calculator"]);
  await go(() => s.page.goBack(), TITLE["/calculators/tip-calculator"]);
  await go(() => s.page.goForward(), TITLE["/calculators/discount-calculator"]);
  await flush(s);
  const seq = views(s).map((h) => `${h.dl} "${short(h.dt)}"`);
  const want = ["/calculators", "/calculators/tip-calculator", "/calculators/discount-calculator", "/calculators/tip-calculator", "/calculators/discount-calculator"];
  check("back/forward: exactly one page_view per display, right titles", views(s).length === 5 && views(s).every((h, i) => h.dl === want[i] && h.dt === (TITLE[want[i]] ?? h.dt)), seq.join("  →  "));
}

// 4. Interactions on every calculator: example, typing (live), Calculate, Copy, Reset.
{
  const bad = [];
  const leaks = [];
  const paramIssues = [];
  let sample = null;
  await pool(ROUTES, 5, async (r) => {
    const s = await session();
    await s.page.goto(`${SITE}${r}`);
    await s.page.getByRole("button", { name: "Try the example", exact: true }).waitFor({ timeout: 15000 });
    await s.page.waitForTimeout(2500);
    await s.page.getByRole("button", { name: "Try the example", exact: true }).click();
    await s.page.waitForTimeout(300);
    // Live edits: type a sentinel into a text/number input if the calculator has one (must send nothing).
    const typed = await s.page.evaluate(() => {
      const el = Array.from(document.querySelectorAll("form input")).find((i) => i.type === "number" || i.type === "text");
      return el ? (el.focus(), true) : false;
    });
    if (typed) await s.page.keyboard.type(SENTINEL, { delay: 10 });
    await s.page.waitForTimeout(300);
    await s.page.getByRole("button", { name: "Calculate", exact: true }).click();
    await s.page.waitForTimeout(300);
    const headline = (await s.page.locator("[aria-live] .text-2xl").first().textContent().catch(() => "")) ?? "";
    const copyBtn = s.page.getByRole("button", { name: "Copy result", exact: true });
    const canCopy = (await copyBtn.count()) > 0;
    if (canCopy) await copyBtn.click();
    await s.page.waitForTimeout(500);
    await s.page.getByRole("button", { name: "Reset", exact: true }).click();
    await flush(s);
    const ev = calcEvents(s);
    const resultAfterButton = ev.filter((e) => e.en === "calculator_result")[1]?.ep["ep.result_status"];
    const expected = ["calculator_calculate", "calculator_result", "calculator_calculate", "calculator_result", ...(canCopy && resultAfterButton === "ok" ? ["calculator_copy_result"] : []), "calculator_reset"];
    const got = ev.map((e) => e.en);
    if (JSON.stringify(got) !== JSON.stringify(expected) || ev[0]?.ep["ep.trigger"] !== "example" || ev[2]?.ep["ep.trigger"] !== "button") bad.push(`${r}: ${got.join(",")} (triggers ${ev.map((e) => e.ep["ep.trigger"]).filter(Boolean).join(",")})`);
    const id = r.split("/").pop();
    for (const e of ev) {
      if (e.ep["ep.calculator_name"] !== id) paramIssues.push(`${r}: calculator_name=${e.ep["ep.calculator_name"]}`);
      for (const k of Object.keys(e.ep)) if (!ALLOWED_EVENT_PARAMS.has(k)) paramIssues.push(`${r}: unexpected parameter ${k}`);
    }
    const all = s.hits.map((h) => h.raw).join("\n");
    if (all.includes(SENTINEL)) leaks.push(`${r}: typed value in a hit`);
    const h = headline.trim();
    if (h.length > 2 && (all.includes(encodeURIComponent(h)) || all.includes(h))) leaks.push(`${r}: result "${h}" in a hit`);
    if (r === "/calculators/loan-emi-calculator") sample = ev.map((e) => ({ en: e.en, dl: e.dl, ...e.ep }));
    if (s.errors.length) bad.push(`${r}: page errors ${s.errors.join(" | ")}`);
    await s.ctx.close();
  });
  check("interactions on 30/30 calculators: exactly one event per explicit action, live edits send nothing", bad.length === 0, bad.join("\n       "));
  check("event parameters: only the six allowed ones, calculator_name always the route's calculator", paramIssues.length === 0, paramIssues.slice(0, 5).join("\n       "));
  check("no entered value or calculation result in any hit (30/30)", leaks.length === 0, leaks.join("\n       "));
  console.log(`\n   sample payloads (loan-emi-calculator):\n${(sample ?? []).map((e) => "     " + JSON.stringify(e)).join("\n")}\n`);
}

// 5. Invalid result.
{
  const s = await session();
  await s.page.goto(`${SITE}/calculators/loan-emi-calculator`);
  await s.page.getByRole("button", { name: "Calculate", exact: true }).waitFor();
  await s.page.waitForTimeout(2500);
  await s.page.locator("form input").first().fill("");
  await s.page.getByRole("button", { name: "Calculate", exact: true }).click();
  await flush(s);
  const ev = calcEvents(s);
  check("invalid input: calculator_calculate (button) + calculator_result (invalid)", ev.length === 2 && ev[1].ep["ep.result_status"] === "invalid", JSON.stringify(ev.map((e) => [e.en, e.ep["ep.result_status"] ?? e.ep["ep.trigger"]])));
  await s.ctx.close();
}

// 6. Consent area: nothing before consent; sent after; dropped while withdrawn; resumes on re-consent.
{
  const s = await session({ region: true, cmp: "eea" });
  await s.page.goto(`${SITE}/calculators/tip-calculator`);
  await s.page.getByRole("button", { name: "Try the example", exact: true }).waitFor();
  await s.page.waitForTimeout(2500);
  await s.page.getByRole("button", { name: "Try the example", exact: true }).click();
  await s.page.getByRole("button", { name: "Reset", exact: true }).click();
  await s.page.waitForTimeout(3000);
  const beforeConsent = s.hits.length;
  await s.page.evaluate(() => window.__setConsent(true));
  await s.page.waitForTimeout(3000);
  await s.page.getByRole("button", { name: "Reset", exact: true }).click(); // 1 event
  await s.page.waitForTimeout(500);
  await s.page.evaluate(() => window.__setConsent(false));
  await s.page.waitForTimeout(500);
  await s.page.getByRole("button", { name: "Try the example", exact: true }).click(); // dropped
  await s.page.getByRole("button", { name: "Reset", exact: true }).click(); // dropped
  await s.page.waitForTimeout(6000);
  const duringWithdrawn = calcEvents(s).length;
  await s.page.evaluate(() => window.__setConsent(true));
  await s.page.waitForTimeout(1500);
  await s.page.getByRole("button", { name: "Reset", exact: true }).click(); // 1 event
  await flush(s);
  const ev = calcEvents(s).map((e) => e.en);
  check("consent area, before consent: no hits at all, and earlier clicks are not queued", beforeConsent === 0 && !calcEvents(s).some((e) => e.en === "calculator_calculate"));
  check("after consent: event sent; while withdrawn: dropped; after re-consent: sent again", JSON.stringify(ev) === JSON.stringify(["calculator_reset", "calculator_reset"]) && duringWithdrawn === 1, `${ev.join(", ")} (during withdrawal: ${duringWithdrawn})`);
  const v = views(s);
  check("page views in the consent flow: tag's automatic one on consent, one manual on re-consent, right title", v.length === 2 && v.every((h) => h.dl === "/calculators/tip-calculator" && h.dt === TITLE["/calculators/tip-calculator"]), v.map((h) => `${h.dl} "${short(h.dt)}"`).join(" → "));
  await s.ctx.close();
}

await browser.close();
server.close();
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
