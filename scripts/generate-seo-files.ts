// ---------------------------------------------------------------------
// Generates robots.txt and the sitemap set into public/:
//
//   sitemap.xml          sitemap index → every child below
//   sitemap-pages.xml    home, directories, about/contact/legal
//   sitemap-tools.xml    every tool page in TOOL_DEFINITIONS
//   sitemap-guides.xml   every guide in GUIDES
//
// All URLs come from the same data the app routes from (see
// src/lib/seo/sitemap.ts), so the sitemaps can't drift from the real
// routes. Run via `npm run seo:generate` (part of `dev` and `build`);
// Vite copies public/ verbatim into dist/, so each file is served at its
// own URL and can be submitted to Search Console independently.
//
// Run with tsx (a plain-Node TS loader) rather than through Vite, since
// this needs to execute before/without a Vite dev or build context.
// ---------------------------------------------------------------------

import { readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { SITE_URL } from "../src/config/site";
import { buildSitemapFiles, renderSitemapIndex, renderUrlset } from "../src/lib/seo/sitemap";
import { renderGuideIndexModule } from "../src/lib/seo/guideIndex";
import { GUIDES } from "../src/data/guides";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

function buildRobots(): string {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

// Clear child sitemaps from a previous run so a shrunk group can't leave a stale file behind.
for (const file of readdirSync(publicDir)) {
  if (/^sitemap-.+\.xml$/.test(file)) unlinkSync(path.join(publicDir, file));
}

const files = buildSitemapFiles();
for (const file of files) {
  writeFileSync(path.join(publicDir, file.fileName), renderUrlset(file.entries));
}
writeFileSync(path.join(publicDir, "sitemap.xml"), renderSitemapIndex(files));
writeFileSync(path.join(publicDir, "robots.txt"), buildRobots());
writeFileSync(path.resolve(__dirname, "../src/data/guideIndex.generated.ts"), renderGuideIndexModule(GUIDES));

const summary = files.map((f) => `${f.fileName} (${f.entries.length})`).join(", ");
console.log(`Generated sitemap.xml index → ${summary}, and robots.txt in ${publicDir}`);
