import { describe, expect, it } from "vitest";
import { HUBS, releasedHubs } from "../hubs";
import { toolRegistry } from "../../lib/toolRegistry";
import { sitemapGroups } from "../../lib/seo/sitemap";
import { hubGroups, hubGuides } from "../../lib/hubContent";

describe("hubs", () => {
  const released = toolRegistry.getHubs();

  it("every tool belongs to a defined hub", () => {
    const ids = new Set(HUBS.map((h) => h.id));
    for (const tool of toolRegistry.getAll()) expect(ids.has(tool.hub), tool.slug).toBe(true);
  });

  it("only hubs with released tools are shown", () => {
    expect(released.map((h) => h.id)).toEqual(["pdf", "image", "developer"]);
    expect(releasedHubs({})).toEqual([]);
    for (const hub of released) expect(toolRegistry.getByHub(hub.id).length).toBeGreaterThan(0);
  });

  it("released hubs have complete, unique page content", () => {
    const titles = new Set<string>();
    for (const hub of released) {
      expect(hub.intro.length, hub.id).toBeGreaterThanOrEqual(2);
      expect(hub.metaDescription.length, hub.id).toBeGreaterThan(100);
      expect(hub.metaDescription.length, hub.id).toBeLessThanOrEqual(160);
      expect(titles.has(hub.seoTitle)).toBe(false);
      titles.add(hub.seoTitle);
      expect(hubGroups(toolRegistry.getByHub(hub.id)).flatMap((g) => g.tools)).toHaveLength(toolRegistry.getByHub(hub.id).length);
      expect(hubGuides(hub).length, hub.id).toBeGreaterThan(0);
    }
  });

  it("sitemaps have one group per released hub, holding the hub page and its tools", () => {
    const groups = sitemapGroups();
    for (const hub of released) {
      const group = groups.find((g) => g.name === hub.path.slice(1));
      expect(group, hub.id).toBeDefined();
      expect(group!.entries.map((e) => e.path)).toEqual([hub.path, ...toolRegistry.getByHub(hub.id).map((t) => `/tools/${t.slug}`)]);
    }
    for (const hub of HUBS.filter((h) => !released.includes(h))) expect(groups.some((g) => g.name === hub.path.slice(1))).toBe(false);
  });

  it("recently added and featured come from registry metadata", () => {
    const recent = toolRegistry.getRecentlyAdded(4);
    expect(recent.every((t) => t.addedOn === "2026-11-04")).toBe(true);
    expect(toolRegistry.getFeatured().length).toBeGreaterThanOrEqual(4);
  });
});
