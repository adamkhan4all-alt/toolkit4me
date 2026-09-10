// ---------------------------------------------------------------------
// Generates robots.txt and sitemap.xml straight from the same
// TOOL_DEFINITIONS the app itself renders from, so the two can never
// drift out of sync with the actual set of routes. Run via `npm run
// seo:generate` (also wired as a `prebuild` step) — writes into public/
// so both `vite dev` and `vite build` pick the files up automatically
// (Vite copies everything in public/ verbatim into dist/).
//
// Run with tsx (a plain-Node TS loader) rather than through Vite, since
// this needs to execute before/without a Vite dev or build context.
// ---------------------------------------------------------------------

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { TOOL_DEFINITIONS } from "../src/data/tools";
import { SITE_URL } from "../src/config/site";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

const staticRoutes = ["/", "/tools"];
const toolRoutes = TOOL_DEFINITIONS.map((t) => `/tools/${t.slug}`);
const allRoutes = [...staticRoutes, ...toolRoutes];

function buildSitemap(): string {
  const urls = allRoutes
    .map((route) => {
      const priority = route === "/" ? "1.0" : route === "/tools" ? "0.8" : "0.9";
      const changefreq = route === "/" || route === "/tools" ? "weekly" : "monthly";
      return `  <url>
    <loc>${SITE_URL}${route}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function buildRobots(): string {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

writeFileSync(path.join(publicDir, "sitemap.xml"), buildSitemap());
writeFileSync(path.join(publicDir, "robots.txt"), buildRobots());

console.log(`Generated sitemap.xml with ${allRoutes.length} URLs and robots.txt in ${publicDir}`);
