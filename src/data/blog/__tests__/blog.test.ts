// Content rules for the Blog & Resource Center, enforced at test time so an article can't be published with
// an invented tool, a broken link, an unlabelled or mis-sized image, or a stale generated index.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ALL_ARTICLES } from "../articles";
import { BLOG_INDEX, ARTICLE_LOADERS } from "../blogIndex.generated";
import { BLOG_CATEGORIES, getBlogCategory } from "../categories";
import { BLOG_AUTHORS } from "../authors";
import { TAG_LABELS } from "../tags";
import { articlePath, headingId, relatedArticlesFor, searchArticles, featuredArticle } from "../meta";
import type { BlogArticle } from "../types";
import { buildBlogIndex, publishedArticles } from "../../../lib/seo/blogIndex";
import { blogCategoryPages, blogSitemapEntries, blogTagPages } from "../../../lib/seo/blogPages";
import { STATIC_PAGES } from "../../../lib/seo/pages";
import { blogToolInfo, BLOG_HOME_TOOLS } from "../../../lib/blog/tools";
import { isExternalHref, linkTargets, parseInline } from "../../../lib/blog/inline";
import { toolRegistry } from "../../../lib/toolRegistry";
import { listingPath } from "../../../types/tool";
import { GUIDES } from "../../guides";

const ROOT = path.resolve(__dirname, "../../../..");
const PUBLIC = path.join(ROOT, "public");
const published = publishedArticles(ALL_ARTICLES);

/** Every internal route an article may link to. */
const KNOWN_ROUTES = new Set<string>([
  ...STATIC_PAGES.map((p) => p.path),
  ...toolRegistry.getListings().map(listingPath),
  ...toolRegistry.getHubs().map((h) => h.path),
  ...GUIDES.map((g) => g.path),
  "/blog",
  ...published.map((a) => articlePath(a.slug)),
  ...BLOG_CATEGORIES.map((c) => `/blog/category/${c.id}`),
]);

/** All text fields of an article that may carry inline markup. */
function textFields(a: BlogArticle): string[] {
  return [
    ...a.takeaways,
    ...a.intro,
    ...a.sections.flatMap((s) => [
      ...(s.paragraphs ?? []),
      ...(s.list ?? []),
      ...(s.steps ?? []),
      ...(s.table ? s.table.rows.flat() : []),
      ...(s.callout?.body ?? []),
      ...(s.subsections ?? []).flatMap((sub) => [...(sub.paragraphs ?? []), ...(sub.list ?? []), ...(sub.steps ?? [])]),
    ]),
    ...(a.faq ?? []).map((f) => f.answer),
  ];
}

function figures(a: BlogArticle) {
  return [a.hero, ...a.sections.flatMap((s) => (s.figure ? [s.figure] : []))];
}

/** Pixel dimensions of a WebP or PNG file, or the width/height attributes of an SVG. */
function imageSize(file: string): { width: number; height: number } {
  const buf = readFileSync(file);
  if (file.endsWith(".png")) return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  if (file.endsWith(".svg")) {
    const head = buf.toString("utf8", 0, 400);
    return { width: Number(/width="(\d+)"/.exec(head)?.[1]), height: Number(/height="(\d+)"/.exec(head)?.[1]) };
  }
  // WebP: VP8 (lossy), VP8L (lossless) or VP8X (extended) chunk.
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8X") return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
  if (chunk === "VP8L") {
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
}

describe("blog articles", () => {
  it("have unique slugs that match their file names, and every file is registered", () => {
    const slugs = ALL_ARTICLES.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const files = readdirSync(path.join(ROOT, "src/data/blog/articles")).filter((f) => f !== "index.ts").map((f) => f.replace(/\.ts$/, ""));
    expect(files.sort()).toEqual([...slugs].sort());
  });

  it.each(ALL_ARTICLES.map((a) => [a.slug, a] as const))("%s has valid metadata", (_slug, a) => {
    expect(getBlogCategory(a.category)).toBeDefined();
    expect(BLOG_AUTHORS.some((au) => au.id === a.author)).toBe(true);
    for (const t of a.tags) expect(TAG_LABELS[t], `tag "${t}" needs a label in tags.ts`).toBeDefined();
    expect(a.published).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(a.updated >= a.published).toBe(true);
    expect(a.metaDescription.length).toBeGreaterThanOrEqual(110);
    expect(a.metaDescription.length).toBeLessThanOrEqual(200);
    expect(a.takeaways.length).toBeGreaterThanOrEqual(3);
    expect(a.sections.length).toBeGreaterThanOrEqual(4);
  });

  it.each(published.map((a) => [a.slug, a] as const))("%s only recommends real tools, guides and articles", (_slug, a) => {
    expect(a.relatedTools.length).toBeGreaterThan(0);
    for (const id of a.relatedTools) expect(blogToolInfo(id), `unknown tool id "${id}"`).toBeDefined();
    for (const g of a.relatedGuides ?? []) expect(GUIDES.some((x) => x.path === g), `unknown guide ${g}`).toBe(true);
    for (const s of a.relatedArticles ?? []) expect(published.some((x) => x.slug === s && s !== a.slug), `unknown article ${s}`).toBe(true);
  });

  it.each(published.map((a) => [a.slug, a] as const))("%s links only to real routes and https sources", (_slug, a) => {
    for (const text of textFields(a)) {
      for (const href of linkTargets(text)) {
        if (isExternalHref(href)) expect(href.startsWith("https://"), href).toBe(true);
        else expect(KNOWN_ROUTES.has(href.split("#")[0]), `broken internal link ${href}`).toBe(true);
      }
    }
    for (const r of a.references ?? []) expect(r.url.startsWith("https://")).toBe(true);
  });

  it.each(published.map((a) => [a.slug, a] as const))("%s has labelled, correctly sized, existing images and a share image", (_slug, a) => {
    for (const f of figures(a)) {
      const file = path.join(PUBLIC, f.src);
      expect(existsSync(file), `${f.src} is missing`).toBe(true);
      expect(f.alt.length).toBeGreaterThanOrEqual(40);
      expect(f.src.startsWith(`/images/blog/${a.slug}/`)).toBe(true);
      expect(imageSize(file), `${f.src} declared size`).toEqual({ width: f.width, height: f.height });
    }
    expect(a.hero.kind).toBe("illustration");
    const share = path.join(PUBLIC, `images/blog/${a.slug}/share.png`);
    expect(existsSync(share)).toBe(true);
    expect(imageSize(share)).toEqual({ width: 1200, height: 630 });
  });

  it.each(ALL_ARTICLES.map((a) => [a.slug, a] as const))("%s has unique heading anchors and never uses raw HTML", (_slug, a) => {
    const ids = [...a.sections.map((s) => headingId(s.heading)), ...a.sections.flatMap((s) => (s.subsections ?? []).map((sub) => headingId(sub.heading)))];
    expect(new Set(ids).size).toBe(ids.length);
    for (const text of textFields(a)) expect(text).not.toMatch(/<[a-z/][^>]*>/i);
  });

  it("the browser-vs-server table matches each tool's real processing mode", () => {
    const article = ALL_ARTICLES.find((a) => a.slug === "improve-your-digital-workflow-with-browser-based-tools")!;
    const table = article.sections.find((s) => s.table?.headers[0].startsWith("Runs in your browser"))!.table!;
    for (const [browserCell, serverCell] of table.rows) {
      for (const href of linkTargets(browserCell).filter((h) => h.startsWith("/tools/"))) expect(blogToolInfo(href.slice(7))?.processing, href).toBe("browser");
      for (const href of linkTargets(serverCell).filter((h) => h.startsWith("/tools/"))) expect(blogToolInfo(href.slice(7))?.processing, href).toBe("server");
    }
  });
});

describe("generated blog index", () => {
  it("matches the article files (run `npm run seo:generate` if this fails)", () => {
    expect(BLOG_INDEX).toEqual(buildBlogIndex(ALL_ARTICLES));
    expect(Object.keys(ARTICLE_LOADERS).sort()).toEqual(published.map((a) => a.slug).sort());
  });

  it("never includes drafts", () => {
    const draft = { ...ALL_ARTICLES[0], slug: "a-draft", status: "draft" as const };
    expect(buildBlogIndex([...ALL_ARTICLES, draft]).map((a) => a.slug)).not.toContain("a-draft");
  });

  it("each loader returns its own article", async () => {
    for (const [slug, load] of Object.entries(ARTICLE_LOADERS)) expect((await load()).slug).toBe(slug);
  });
});

describe("blog listing helpers", () => {
  it("search matches every word, ranks title matches first, and returns nothing for an empty query", () => {
    expect(searchArticles(BLOG_INDEX, "")).toEqual([]);
    const pdf = searchArticles(BLOG_INDEX, "PDF");
    expect(pdf.length).toBeGreaterThan(0);
    expect(pdf[0].title.toLowerCase()).toContain("pdf");
    expect(searchArticles(BLOG_INDEX, "students pdf").map((a) => a.slug)).toContain("how-students-can-use-pdf-tools-to-study-efficiently");
    expect(searchArticles(BLOG_INDEX, "zzzz-no-such-word")).toEqual([]);
  });

  it("related articles exclude the article itself and put its own picks first", () => {
    for (const a of BLOG_INDEX) {
      const related = relatedArticlesFor(a, BLOG_INDEX);
      expect(related.map((r) => r.slug)).not.toContain(a.slug);
      expect(related.slice(0, a.relatedArticles.length).map((r) => r.slug)).toEqual(a.relatedArticles.slice(0, 3));
    }
  });

  it("has a featured article", () => {
    expect(featuredArticle(BLOG_INDEX)?.featured).toBe(true);
  });

  it("home-page tool recommendations are real", () => {
    for (const id of BLOG_HOME_TOOLS) expect(blogToolInfo(id)).toBeDefined();
  });

  it("category guides exist", () => {
    for (const c of BLOG_CATEGORIES) for (const g of c.relatedGuides) expect(GUIDES.some((x) => x.path === g), g).toBe(true);
  });
});

describe("blog sitemap", () => {
  const entries = blogSitemapEntries(BLOG_INDEX).map((e) => e.path);

  it("lists /blog, every published article and only indexable listing pages", () => {
    expect(entries).toContain("/blog");
    for (const a of BLOG_INDEX) expect(entries).toContain(a.path);
    for (const p of blogCategoryPages(BLOG_INDEX)) expect(entries.includes(p.path)).toBe(p.indexable);
    for (const p of blogTagPages(BLOG_INDEX)) expect(entries.includes(p.path)).toBe(p.indexable);
    expect(new Set(entries).size).toBe(entries.length);
  });

  it("indexes a category only once it has an article, and a tag only with at least two", () => {
    for (const p of blogCategoryPages(BLOG_INDEX)) expect(p.indexable).toBe(p.articles.length > 0);
    for (const p of blogTagPages(BLOG_INDEX)) expect(p.indexable).toBe(p.articles.length >= 2);
  });
});

describe("inline markup", () => {
  it("parses links and bold, and keeps plain text", () => {
    expect(parseInline("See [the guide](/guides/x) and **this**.")).toEqual([
      { type: "text", text: "See " },
      { type: "link", text: "the guide", href: "/guides/x" },
      { type: "text", text: " and " },
      { type: "bold", text: "this" },
      { type: "text", text: "." },
    ]);
  });
});
