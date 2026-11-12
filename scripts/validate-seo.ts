// ---------------------------------------------------------------------
// SEO and sitemap validation for the production build.
//
//   npm run build && npm run seo:validate          # checks dist/
//   npm run seo:validate -- --live                 # also requests every sitemap URL from the live site
//
// Checks: sitemap index and child sitemaps are well-formed XML with absolute
// https URLs on the canonical host, no duplicates; every sitemap URL has a
// prerendered page and every indexable page is in a sitemap; each page has
// one title, one description, one H1, the right canonical, valid JSON-LD
// and the AdSense tag once; titles and descriptions are unique; internal
// links resolve; robots.txt points at the sitemap index. With --live, every
// sitemap URL must answer 200 directly (no redirect, no noindex header).
// Exits non-zero on any problem.
// ---------------------------------------------------------------------
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_URL } from "../src/config/site";

const HOST = SITE_URL.replace(/\/$/, "");
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
const live = process.argv.includes("--live");
const problems: string[] = [];
const fail = (msg: string) => problems.push(msg);

if (!existsSync(dist)) {
  console.error("dist/ not found — run `npm run build` first.");
  process.exit(1);
}

// --- Sitemaps ---
function locs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
function checkXml(name: string, xml: string, root: "sitemapindex" | "urlset") {
  if (!xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) fail(`${name}: missing XML declaration`);
  if (!new RegExp(`<${root} xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">[\\s\\S]*</${root}>\\s*$`).test(xml)) fail(`${name}: root element is not a ${root} in the sitemap namespace`);
  const opened = (xml.match(/<(url|sitemap)>/g) ?? []).length;
  const closed = (xml.match(/<\/(url|sitemap)>/g) ?? []).length;
  if (opened !== closed) fail(`${name}: unbalanced <url>/<sitemap> tags`);
  for (const m of xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) if (!/^\d{4}-\d{2}-\d{2}$/.test(m[1])) fail(`${name}: bad lastmod ${m[1]}`);
  if (/&(?!amp;|lt;|gt;|quot;|apos;)/.test(xml)) fail(`${name}: unescaped ampersand`);
}

const indexXml = readFileSync(path.join(dist, "sitemap.xml"), "utf8");
checkXml("sitemap.xml", indexXml, "sitemapindex");
const childUrls = locs(indexXml);
const sitemapUrls: string[] = [];
for (const url of childUrls) {
  if (!url.startsWith(`${HOST}/sitemap-`)) fail(`sitemap index lists ${url} — expected ${HOST}/sitemap-*.xml`);
  const file = path.join(dist, url.replace(`${HOST}/`, ""));
  if (!existsSync(file)) {
    fail(`sitemap index lists ${url}, but the file doesn't exist`);
    continue;
  }
  const xml = readFileSync(file, "utf8");
  checkXml(path.basename(file), xml, "urlset");
  sitemapUrls.push(...locs(xml));
}
for (const file of readdirSync(dist).filter((f) => /^sitemap-.+\.xml$/.test(f))) {
  if (!childUrls.includes(`${HOST}/${file}`)) fail(`${file} exists but isn't listed in sitemap.xml`);
}
const seen = new Set<string>();
for (const url of sitemapUrls) {
  if (!url.startsWith(`${HOST}/`) && url !== HOST) fail(`sitemap URL not on ${HOST}: ${url}`);
  if (url !== `${HOST}/` && url.endsWith("/")) fail(`sitemap URL has a trailing slash: ${url}`);
  if (url.includes("?") || url.includes("#")) fail(`sitemap URL has a query or fragment: ${url}`);
  if (seen.has(url)) fail(`duplicate sitemap URL: ${url}`);
  seen.add(url);
}

// --- robots.txt ---
const robots = readFileSync(path.join(dist, "robots.txt"), "utf8");
if (!robots.includes(`Sitemap: ${HOST}/sitemap.xml`)) fail("robots.txt doesn't reference the sitemap index");
if (/^Disallow:\s*\/\s*$/m.test(robots)) fail("robots.txt disallows the whole site");

// --- Pages ---
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(path.join(d, f)).isDirectory() ? walk(path.join(d, f)) : [path.join(d, f)]));
const pageFor = (p: string) => path.join(dist, p === "/" ? "index.html" : `${p.slice(1)}/index.html`);
const titles = new Map<string, string[]>();
const descriptions = new Map<string, string[]>();
const pages = walk(dist).filter((f) => f.endsWith(".html"));

for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const route = ("/" + path.relative(dist, file).split(path.sep).join("/")).replace(/index\.html$/, "").replace(/\/$/, "") || "/";
  const count = (re: RegExp) => (html.match(re) ?? []).length;
  const canonical = [...html.matchAll(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/g)].map((m) => m[1]);
  const noindex = /name="robots" content="noindex/.test(html);

  if (count(/<title/g) !== 1) fail(`${route}: ${count(/<title/g)} <title> tags`);
  if (count(/name="description"/g) !== 1) fail(`${route}: ${count(/name="description"/g)} meta descriptions`);
  if (count(/<h1[\s>]/g) !== 1) fail(`${route}: ${count(/<h1[\s>]/g)} H1s`);
  if (count(/adsbygoogle\.js\?client=ca-pub-/g) !== 1) fail(`${route}: AdSense tag appears ${count(/adsbygoogle\.js\?client=ca-pub-/g)} times`);
  if (noindex) {
    if (canonical.length) fail(`${route}: noindex page has a canonical`);
    if (sitemapUrls.includes(`${HOST}${route}`)) fail(`${route}: noindex page is in a sitemap`);
  } else {
    const expected = route === "/" ? `${HOST}/` : `${HOST}${route}`;
    if (canonical.length !== 1 || canonical[0] !== expected) fail(`${route}: canonical ${canonical.join(", ") || "missing"} — expected ${expected}`);
    if (!seen.has(expected)) fail(`${route}: indexable page missing from the sitemaps`);
  }
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch {
      fail(`${route}: invalid JSON-LD`);
    }
  }
  const title = html.match(/<title[^>]*>([^<]*)/)?.[1] ?? "";
  const description = html.match(/name="description" content="([^"]*)/)?.[1] ?? "";
  titles.set(title, [...(titles.get(title) ?? []), route]);
  descriptions.set(description, [...(descriptions.get(description) ?? []), route]);
  for (const m of html.matchAll(/href="(\/[^"#]*)"/g)) {
    const href = m[1].split("?")[0];
    if (href.startsWith("/assets/") || /\.(svg|png|webp|ico|css|js|xml|txt)$/.test(href)) continue;
    if (!existsSync(pageFor(href.replace(/\/$/, "") || "/"))) fail(`${route}: broken internal link ${href}`);
  }
}
for (const [, routes] of titles) if (routes.length > 1) fail(`duplicate title on ${routes.join(", ")}`);
for (const [, routes] of descriptions) if (routes.length > 1) fail(`duplicate description on ${routes.join(", ")}`);
for (const url of seen) if (!existsSync(pageFor(url.replace(HOST, "") || "/"))) fail(`sitemap URL with no prerendered page: ${url}`);

// --- Live HTTP checks ---
async function checkLive() {
  const urls = [...seen];
  let next = 0;
  async function worker() {
    while (next < urls.length) {
      const url = urls[next++];
      try {
        const res = await fetch(url, { redirect: "manual" });
        if (res.status !== 200) fail(`live: ${url} answered ${res.status}${res.headers.get("location") ? ` → ${res.headers.get("location")}` : ""}`);
        if (/noindex/i.test(res.headers.get("x-robots-tag") ?? "")) fail(`live: ${url} sends X-Robots-Tag noindex`);
      } catch (err) {
        fail(`live: ${url} failed (${(err as Error).message})`);
      }
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  for (const url of [`${HOST}/sitemap.xml`, ...childUrls]) {
    const res = await fetch(url, { redirect: "manual" });
    if (res.status !== 200 || !/xml/.test(res.headers.get("content-type") ?? "")) fail(`live: ${url} answered ${res.status} ${res.headers.get("content-type")}`);
  }
}
if (live) await checkLive();

console.log(`Checked ${pages.length} pages, ${childUrls.length} child sitemaps, ${seen.size} sitemap URLs${live ? " (and every URL live)" : ""}.`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("No problems found.");
