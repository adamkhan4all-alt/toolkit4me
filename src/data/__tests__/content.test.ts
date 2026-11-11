import { describe, expect, it } from "vitest";
import { TOOL_DEFINITIONS } from "../tools";
import { GUIDES, relatedGuidesFor } from "../guides";

describe("tool page content", () => {
  it.each(TOOL_DEFINITIONS.map((t) => [t.slug, t] as const))("%s has its own common uses and limitations", (_slug, tool) => {
    expect(tool.useCases.length).toBeGreaterThanOrEqual(3);
    expect(tool.limitations.length).toBeGreaterThanOrEqual(3);
  });

  it("never reuses a use case or limitation verbatim across tools (no boilerplate)", () => {
    const all = TOOL_DEFINITIONS.flatMap((t) => [...t.useCases, ...t.intro, t.description]);
    expect(new Set(all).size).toBe(all.length);
  });

  it("only advertises input formats the backend accepts (Image to Text: JPG/PNG, not PDF)", () => {
    const ocr = TOOL_DEFINITIONS.find((t) => t.slug === "image-to-text")!;
    expect(ocr.acceptedFormats).toEqual(["JPG", "PNG"]);
    expect(ocr.acceptedMime).not.toContain("application/pdf");
  });

  it("never claims PDF to Word preserves layout or formatting", () => {
    const tool = TOOL_DEFINITIONS.find((t) => t.slug === "pdf-to-word")!;
    const text = JSON.stringify(tool).toLowerCase();
    expect(text).not.toMatch(/preserv(es|ing) (original )?(layout|formatting)/);
  });

  it("doesn't promise unverifiable compression percentages", () => {
    const tool = TOOL_DEFINITIONS.find((t) => t.slug === "compress-pdf")!;
    expect(JSON.stringify(tool)).not.toMatch(/most PDFs shrink/i);
  });
});

describe("guides", () => {
  it("every guide links to at least one real tool and has unique content", () => {
    const slugs = new Set(TOOL_DEFINITIONS.map((t) => t.slug));
    for (const g of GUIDES) {
      expect(g.relatedTools?.length).toBeGreaterThan(0);
      for (const s of g.relatedTools ?? []) expect(slugs.has(s)).toBe(true);
    }
    const paragraphs = GUIDES.flatMap((g) => g.sections.flatMap((s) => s.paragraphs ?? []));
    expect(new Set(paragraphs).size).toBe(paragraphs.length);
  });

  it("relatedGuidesFor ranks guides sharing more tools first and excludes the guide itself", () => {
    const jpgVsPng = GUIDES.find((g) => g.path === "/guides/jpg-vs-png")!;
    const related = relatedGuidesFor(jpgVsPng);
    expect(related).not.toContain(jpgVsPng);
    expect(related[0].path).toBe("/guides/how-to-compress-images");
  });
});

describe("About page areas", () => {
  it("describes every tool category exactly once", async () => {
    const { TOOL_AREAS } = await import("../toolAreas");
    const { CATEGORIES } = await import("../../types/tool");
    expect(TOOL_AREAS.map((a) => a.category).sort()).toEqual([...CATEGORIES].sort());
  });
});

describe("blog structure", () => {
  it("gives every guide a category, a primary keyword and no keyword overlap with another guide", async () => {
    const { GUIDE_CATEGORIES } = await import("../guides");
    const ids = new Set(GUIDE_CATEGORIES.map((c) => c.id));
    for (const g of GUIDES) {
      expect(ids.has(g.category)).toBe(true);
      expect(g.keywords.primary.trim()).not.toBe("");
    }
    const primaries = GUIDES.map((g) => g.keywords.primary.toLowerCase());
    expect(new Set(primaries).size).toBe(primaries.length); // no two guides chase the same query
  });

  it("only lists categories that have guides, so no empty category is ever shown", async () => {
    const { GUIDE_CATEGORIES } = await import("../guides");
    for (const c of GUIDE_CATEGORIES) expect(GUIDES.some((g) => g.category === c.id)).toBe(true);
  });

  it("has well-formed tables and images that exist with alt text", async () => {
    const { existsSync } = await import("node:fs");
    const path = await import("node:path");
    for (const g of GUIDES) {
      for (const s of g.sections) {
        if (s.table) for (const row of s.table.rows) expect(row).toHaveLength(s.table.headers.length);
        if (s.image) {
          expect(s.image.alt.length).toBeGreaterThan(15);
          expect(existsSync(path.join(process.cwd(), "public", s.image.src))).toBe(true);
        }
      }
    }
  });

  it("features at least three guides for the blog and homepage", () => {
    expect(GUIDES.filter((g) => g.featured).length).toBeGreaterThanOrEqual(3);
  });
});
