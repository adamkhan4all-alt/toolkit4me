import { describe, expect, it } from "vitest";
import { toolRegistry, ToolRegistry } from "../toolRegistry";
import type { ToolDefinition } from "../../types/tool";

const REQUIRED_SLUGS = [
  "pdf-to-word",
  "word-to-pdf",
  "jpg-to-pdf",
  "pdf-to-jpg",
  "compress-pdf",
  "merge-pdf",
  "compress-image",
  "image-to-text",
  "jpg-to-png",
  "png-to-jpg",
  "pdf-editor",
  "split-pdf",
  "powerpoint-to-pdf",
  "excel-to-pdf",
  "unlock-pdf",
  "protect-pdf",
  "unprotect-pdf",
];

describe("toolRegistry (singleton)", () => {
  it("contains exactly the 17 required tools", () => {
    expect(toolRegistry.count()).toBe(17);
    const slugs = toolRegistry.getAll().map((t) => t.slug);
    for (const slug of REQUIRED_SLUGS) {
      expect(slugs).toContain(slug);
    }
  });

  it("resolves a known slug to the matching tool", () => {
    const tool = toolRegistry.getBySlug("pdf-to-word");
    expect(tool).toBeDefined();
    expect(tool?.name).toBe("PDF to Word Converter");
    expect(tool?.id).toBe("pdf-to-word");
  });

  it("returns undefined for an unknown slug", () => {
    expect(toolRegistry.getBySlug("does-not-exist")).toBeUndefined();
  });

  it("has() reflects known vs unknown slugs", () => {
    expect(toolRegistry.has("merge-pdf")).toBe(true);
    expect(toolRegistry.has("nonexistent")).toBe(false);
  });

  it("filters tools by category", () => {
    const convertTools = toolRegistry.getByCategory("convert");
    expect(convertTools.length).toBeGreaterThan(0);
    for (const tool of convertTools) {
      expect(tool.category).toBe("convert");
    }

    const mergeTools = toolRegistry.getByCategory("merge");
    expect(mergeTools.map((t) => t.slug)).toEqual(["merge-pdf"]);
  });

  it("resolves relatedTools ids into full ToolDefinition objects", () => {
    const tool = toolRegistry.getBySlug("pdf-to-word")!;
    const related = toolRegistry.getRelated(tool);
    expect(related.length).toBe(tool.relatedTools.length);
    for (const r of related) {
      expect(tool.relatedTools).toContain(r.id);
    }
  });

  it("drops unknown ids when resolving related tools", () => {
    const fake: ToolDefinition = {
      ...toolRegistry.getBySlug("pdf-to-word")!,
      relatedTools: ["merge-pdf", "totally-unknown-id"],
    };
    const related = toolRegistry.getRelated(fake);
    expect(related.map((r) => r.id)).toEqual(["merge-pdf"]);
  });

  it("search matches by name, description, and keyword", () => {
    expect(toolRegistry.search("word").map((t) => t.slug)).toEqual(
      expect.arrayContaining(["pdf-to-word", "word-to-pdf"])
    );
    expect(toolRegistry.search("nonsense-query-xyz")).toEqual([]);
    expect(toolRegistry.search("")).toEqual([]);
  });

  it("every SERVER-mode tool has a non-null endpoint, every CLIENT-mode tool has a null endpoint", () => {
    for (const tool of toolRegistry.getAll()) {
      if (tool.processingMode === "SERVER") {
        expect(tool.endpoint).toEqual(expect.stringContaining("/"));
      } else {
        expect(tool.endpoint).toBeNull();
      }
    }
  });

  it("every tool carries complete SEO metadata and at least one FAQ entry", () => {
    for (const tool of toolRegistry.getAll()) {
      expect(tool.seo.title.length).toBeGreaterThan(0);
      expect(tool.seo.metaDescription.length).toBeGreaterThan(0);
      expect(tool.seo.h1.length).toBeGreaterThan(0);
      expect(tool.faq.length).toBeGreaterThanOrEqual(4);
    }
  });
});

describe("ToolRegistry (constructor)", () => {
  const base: ToolDefinition = toolRegistry.getBySlug("pdf-to-word")!;

  it("throws on duplicate tool ids", () => {
    expect(() => new ToolRegistry([base, { ...base, slug: "other-slug" }])).toThrow(/duplicate tool id/);
  });

  it("throws on duplicate tool slugs", () => {
    expect(() => new ToolRegistry([base, { ...base, id: "other-id" }])).toThrow(/duplicate tool slug/);
  });

  it("builds successfully from a minimal valid fixture", () => {
    const registry = new ToolRegistry([base]);
    expect(registry.count()).toBe(1);
    expect(registry.getBySlug(base.slug)?.id).toBe(base.id);
  });
});
