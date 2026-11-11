// ---------------------------------------------------------------------
// SEO content tracker — writes docs/seo-tracker.csv with one row per
// indexable page: URL, type, target keywords, publication/update dates,
// and (optionally) real performance figures from Google Search Console.
//
//   npm run seo:tracker                          # content columns only
//   npm run seo:tracker -- path/to/Pages.csv     # + Search Console data
//
// The optional file is Search Console's own export: Performance → Pages
// tab → Export → CSV (the "Pages.csv" inside the download). Its columns
// are "Top pages, Clicks, Impressions, CTR, Position". Nothing is ever
// estimated: pages missing from the export are left blank, and indexing
// status stays "not checked" until you record it from URL Inspection.
// ---------------------------------------------------------------------

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TOOL_DEFINITIONS } from "../src/data/tools";
import { GUIDES } from "../src/data/guides";
import { STATIC_PAGES } from "../src/lib/seo/pages";
import { canonicalUrl } from "../src/lib/seo/sitemap";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.resolve(__dirname, "../docs/seo-tracker.csv");

/** Target queries for the non-tool, non-guide pages. */
const PAGE_KEYWORDS: Record<string, { primary: string; secondary: string[] }> = {
  "/": { primary: "free online tools", secondary: ["free tools", "free PDF tools", "free image tools"] },
  "/tools": { primary: "free tools", secondary: ["online tools", "PDF and image tools", "developer tools"] },
  "/guides": { primary: "PDF and image how-to guides", secondary: ["how to compress PDF", "JPG vs PNG", "QR code guide"] },
};

interface Row {
  url: string;
  type: string;
  primary: string;
  secondary: string;
  published: string;
  updated: string;
}

const rows: Row[] = [
  ...STATIC_PAGES.map((p) => ({
    url: canonicalUrl(p.path),
    type: "page",
    primary: PAGE_KEYWORDS[p.path]?.primary ?? "",
    secondary: (PAGE_KEYWORDS[p.path]?.secondary ?? []).join("; "),
    published: "",
    updated: p.lastModified,
  })),
  ...TOOL_DEFINITIONS.map((t) => ({
    url: canonicalUrl(`/tools/${t.slug}`),
    type: "tool",
    primary: t.seo.keywords[0] ?? "",
    secondary: t.seo.keywords.slice(1).join("; "),
    published: "",
    updated: t.lastModified,
  })),
  ...GUIDES.map((g) => ({
    url: canonicalUrl(g.path),
    type: "guide",
    primary: g.keywords.primary,
    secondary: g.keywords.secondary.join("; "),
    published: g.published,
    updated: g.updated,
  })),
];

/** Minimal CSV parser for Search Console exports (quoted fields, commas inside quotes). */
function parseCsv(text: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((f) => f !== "")) out.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f !== "")) out.push(row);
  return out;
}

type Perf = { clicks: string; impressions: string; ctr: string; position: string };
const performance = new Map<string, Perf>();
const exportPath = process.argv[2];
if (exportPath) {
  const [header, ...data] = parseCsv(readFileSync(exportPath, "utf8").replace(/^﻿/, ""));
  const col = (name: string) => header.findIndex((h) => h.trim().toLowerCase() === name);
  const [page, clicks, impressions, ctr, position] = ["top pages", "clicks", "impressions", "ctr", "position"].map(col);
  if ([page, clicks, impressions, ctr, position].some((i) => i < 0)) {
    throw new Error(`"${exportPath}" doesn't look like a Search Console Pages export (expected columns: Top pages, Clicks, Impressions, CTR, Position).`);
  }
  for (const r of data) {
    // Search Console may report the apex or a trailing slash; normalise to our canonical form.
    const url = canonicalUrl(new URL(r[page]).pathname || "/");
    performance.set(url, { clicks: r[clicks], impressions: r[impressions], ctr: r[ctr], position: r[position] });
  }
}

const csvField = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const header = ["Page URL", "Page type", "Primary keyword", "Secondary keywords", "Published", "Last updated", "Google indexing status", "Impressions", "Clicks", "CTR", "Average position"];
const lines = [
  header.join(","),
  ...rows.map((r) => {
    const p = performance.get(r.url);
    return [r.url, r.type, r.primary, r.secondary, r.published, r.updated, "not checked", p?.impressions ?? "", p?.clicks ?? "", p?.ctr ?? "", p?.position ?? ""]
      .map(csvField)
      .join(",");
  }),
];

mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(outFile, lines.join("\n") + "\n");
console.log(`Wrote ${rows.length} pages to ${outFile}${exportPath ? ` (Search Console data matched for ${[...performance.keys()].filter((u) => rows.some((r) => r.url === u)).length} pages)` : " (no Search Console export given — performance columns left blank)"}`);
