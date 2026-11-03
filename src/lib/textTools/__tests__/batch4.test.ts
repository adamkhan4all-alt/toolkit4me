import { describe, expect, it } from "vitest";
import { breadcrumbUrl, buildMetaTags, checkMeta, EMPTY_META, escapeAttr } from "../metaTags";

const full = {
  ...EMPTY_META,
  title: "Handmade Leather Wallets | Smith & Co",
  description: "Slim, hand-stitched leather wallets made to order in our workshop, with free delivery.",
  url: "https://www.example.com/wallets",
  siteName: "Smith & Co",
  imageUrl: "https://www.example.com/share.jpg",
  imageAlt: "Leather wallets",
  twitterHandle: "smithandco",
};

describe("meta tag generator", () => {
  it("builds standard, Open Graph and Twitter tags", () => {
    const html = buildMetaTags(full);
    expect(html).toContain("<title>Handmade Leather Wallets | Smith &amp; Co</title>");
    expect(html).toContain('<link rel="canonical" href="https://www.example.com/wallets" />');
    expect(html).toContain('<meta property="og:image" content="https://www.example.com/share.jpg" />');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(html).toContain('<meta name="twitter:site" content="@smithandco" />');
    expect(html).not.toContain('name="robots"'); // index,follow is the default and needs no tag
  });

  it("produces a well-formed head whose values survive parsing unchanged", () => {
    const tricky = { ...full, title: `5" <Heels> & "Boots"`, description: `He said "hi" & left <script>alert(1)</script>` };
    const doc = new DOMParser().parseFromString(`<html><head>${buildMetaTags(tricky)}</head><body></body></html>`, "text/html");
    expect(doc.title).toBe(tricky.title);
    expect(doc.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(tricky.description);
    expect(doc.querySelectorAll("script")).toHaveLength(0);
    expect(doc.body.children).toHaveLength(0); // nothing leaked out of <head>
  });

  it("omits tags for empty or invalid values instead of emitting them blank", () => {
    const html = buildMetaTags({ ...EMPTY_META, title: "Only a title", imageUrl: "/relative.jpg", url: "not a url" });
    expect(html).not.toContain("og:image");
    expect(html).not.toContain("canonical");
    expect(html).not.toMatch(/content=""/);
    expect(html).toContain('<meta name="twitter:card" content="summary" />');
  });

  it("adds a robots tag only when indexing or following is turned off", () => {
    expect(buildMetaTags({ ...full, index: false })).toContain('<meta name="robots" content="noindex, follow" />');
    expect(buildMetaTags({ ...full, follow: false })).toContain('<meta name="robots" content="index, nofollow" />');
  });

  it("flags missing, long and invalid values", () => {
    const fields = (input: typeof full) => checkMeta(input).map((i) => `${i.field}:${i.level}`);
    expect(fields({ ...EMPTY_META })).toContain("title:error");
    expect(fields({ ...full, title: "x".repeat(70) })).toContain("title:warning");
    expect(fields({ ...full, description: "y".repeat(200) })).toContain("description:warning");
    expect(fields({ ...full, imageUrl: "images/a.jpg" })).toContain("imageUrl:error");
    expect(fields({ ...full, url: "www.example.com" })).toContain("url:error");
    expect(fields({ ...full, twitterHandle: "@this-is-not-valid!" })).toContain("twitterHandle:error");
    expect(checkMeta(full)).toEqual([]);
  });

  it("escapes attribute values and formats the preview URL", () => {
    expect(escapeAttr(`a"b<c>&d`)).toBe("a&quot;b&lt;c&gt;&amp;d");
    expect(breadcrumbUrl("https://www.example.com/blog/my-post")).toBe("example.com › blog › my-post");
    expect(breadcrumbUrl("nope")).toBe("example.com");
  });
});
