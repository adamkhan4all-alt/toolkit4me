import { describe, expect, it } from "vitest";
import vercelConfig from "../../../../vercel.json";
import { buildSitemapFiles } from "../sitemap";

// vercel.json labels sitemap responses as XML. The rule must match exactly the files the generator publishes:
// a broader pattern also labels Vercel's HTML 404 page as XML for addresses that don't exist (old or mistyped sitemap
// names), and browsers / Search Console then report "StartTag: invalid element name" instead of "not found".

/** The JS equivalent of the header rule's source ("/(<regex>)"). */
function sitemapHeaderPattern(): RegExp {
  const rule = vercelConfig.headers.find((h) => h.headers.some((x) => x.key === "Content-Type" && x.value.startsWith("application/xml")));
  if (!rule) throw new Error("no XML Content-Type rule in vercel.json");
  const m = /^\/\((.*)\)$/.exec(rule.source);
  if (!m) throw new Error(`unexpected source format: ${rule.source}`);
  return new RegExp(`^/${m[1]}$`);
}

describe("vercel.json sitemap Content-Type rule", () => {
  const pattern = sitemapHeaderPattern();
  const published = ["sitemap.xml", ...buildSitemapFiles().map((f) => f.fileName)];

  it("matches the sitemap index and every child sitemap the generator publishes", () => {
    expect(published.length).toBeGreaterThan(1);
    for (const name of published) expect(pattern.test(`/${name}`), name).toBe(true);
  });

  it("matches numbered parts of a split sitemap", () => {
    expect(pattern.test("/sitemap-guides-2.xml")).toBe(true);
  });

  it("does not match sitemap names that don't exist, so they return a plain 404", () => {
    for (const name of ["sitemap-tools.xml", "sitemap-categories.xml", "sitemap-creative.xml", "sitemap-xyz.xml", "sitemap-pages.xml.bak", "sitemap-.xml"]) {
      expect(pattern.test(`/${name}`), name).toBe(false);
    }
  });
});
