import { describe, expect, it } from "vitest";
import { SITE_URL } from "../../../config/site";
import { TOOL_DEFINITIONS } from "../../../data/tools";
import { GUIDES } from "../../../data/guides";
import { STATIC_PAGES } from "../pages";
import { buildSitemapFiles, canonicalUrl, renderSitemapIndex, renderUrlset } from "../sitemap";
import { articleSchema, webApplicationSchema } from "../structuredData";

const NS = "http://www.sitemaps.org/schemas/sitemap/0.9";

function parseXml(xml: string): Document {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  expect(doc.getElementsByTagName("parsererror")).toHaveLength(0);
  return doc;
}

function locs(xml: string): string[] {
  return Array.from(parseXml(xml).getElementsByTagNameNS(NS, "loc")).map((n) => n.textContent ?? "");
}

describe("sitemaps", () => {
  const files = buildSitemapFiles();
  const byName = Object.fromEntries(files.map((f) => [f.fileName, renderUrlset(f.entries)]));

  it("produces exactly the pages, tools and guides child sitemaps", () => {
    expect(files.map((f) => f.fileName)).toEqual(["sitemap-pages.xml", "sitemap-tools.xml", "sitemap-guides.xml"]);
  });

  it("lists every tool in sitemap-tools.xml", () => {
    expect(locs(byName["sitemap-tools.xml"]).sort()).toEqual(TOOL_DEFINITIONS.map((t) => `${SITE_URL}/tools/${t.slug}`).sort());
  });

  it("lists every guide in sitemap-guides.xml", () => {
    expect(locs(byName["sitemap-guides.xml"]).sort()).toEqual(GUIDES.map((g) => `${SITE_URL}${g.path}`).sort());
  });

  it("lists every static page in sitemap-pages.xml, with the homepage as the bare root URL", () => {
    const urls = locs(byName["sitemap-pages.xml"]);
    expect(urls).toHaveLength(STATIC_PAGES.length);
    expect(urls).toContain(`${SITE_URL}/`);
  });

  it("uses only unique, canonical https www URLs with no query string or trailing slash", () => {
    const all = files.flatMap((f) => locs(renderUrlset(f.entries)));
    expect(new Set(all).size).toBe(all.length);
    for (const url of all) {
      expect(url.startsWith("https://www.toolkit4me.com/")).toBe(true);
      expect(url).not.toMatch(/[?#]/);
      if (url !== `${SITE_URL}/`) expect(url.endsWith("/")).toBe(false);
    }
  });

  it("gives every URL a real YYYY-MM-DD lastmod", () => {
    for (const f of files) for (const e of f.entries) expect(e.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("sitemap index references every child sitemap by absolute URL", () => {
    const index = renderSitemapIndex(files);
    expect(parseXml(index).documentElement.localName).toBe("sitemapindex");
    expect(locs(index)).toEqual(files.map((f) => `${SITE_URL}/${f.fileName}`));
  });

  it("splits a group that exceeds the per-file limit into numbered files", () => {
    const entries = Array.from({ length: 5 }, (_, i) => ({ path: `/x/${i}`, lastModified: "2026-01-01" }));
    const split = buildSitemapFiles([{ name: "tools", entries }], 2);
    expect(split.map((f) => [f.fileName, f.entries.length])).toEqual([
      ["sitemap-tools.xml", 2],
      ["sitemap-tools-2.xml", 2],
      ["sitemap-tools-3.xml", 1],
    ]);
  });

  it("canonicalUrl strips query strings and trailing slashes", () => {
    expect(canonicalUrl("/tools/?category=convert")).toBe(`${SITE_URL}/tools`);
    expect(canonicalUrl("/")).toBe(`${SITE_URL}/`);
  });
});

describe("structured data", () => {
  it("never claims ratings or reviews", () => {
    const json = JSON.stringify([...TOOL_DEFINITIONS.map(webApplicationSchema), ...GUIDES.map(articleSchema)]);
    expect(json).not.toMatch(/aggregateRating|"review"/i);
  });

  it("describes each tool as a free WebApplication at its canonical URL", () => {
    const schema = webApplicationSchema(TOOL_DEFINITIONS[0]);
    expect(schema).toMatchObject({ "@type": "WebApplication", url: `${SITE_URL}/tools/${TOOL_DEFINITIONS[0].slug}`, offers: { price: "0" } });
  });
});
