// ---------------------------------------------------------------------
// Centralized tool registry.
//
// This is the ONLY module the router (and every component that needs
// tool data) is allowed to depend on for tool lookups. It wraps the raw
// TOOL_DEFINITIONS array in a small API and enforces uniqueness of id/slug
// at module-load time, so a data-entry mistake fails fast instead of
// silently producing two tools on one route.
//
// Adding tool #11: append one ToolDefinition to TOOL_DEFINITIONS in
// src/data/tools.ts. That's it — the registry, the router, and every
// framework component pick it up automatically.
// ---------------------------------------------------------------------

import { TOOL_DEFINITIONS } from "../data/tools";
import type { ToolCategory, ToolDefinition } from "../types/tool";

function buildRegistry(definitions: ToolDefinition[]) {
  const byId = new Map<string, ToolDefinition>();
  const bySlug = new Map<string, ToolDefinition>();

  for (const tool of definitions) {
    if (byId.has(tool.id)) {
      throw new Error(`ToolRegistry: duplicate tool id "${tool.id}"`);
    }
    if (bySlug.has(tool.slug)) {
      throw new Error(`ToolRegistry: duplicate tool slug "${tool.slug}"`);
    }
    byId.set(tool.id, tool);
    bySlug.set(tool.slug, tool);
  }

  return { byId, bySlug };
}

class ToolRegistry {
  private byId: Map<string, ToolDefinition>;
  private bySlug: Map<string, ToolDefinition>;
  private ordered: ToolDefinition[];

  constructor(definitions: ToolDefinition[]) {
    const { byId, bySlug } = buildRegistry(definitions);
    this.byId = byId;
    this.bySlug = bySlug;
    this.ordered = definitions;
  }

  /** All registered tools, in registration order. */
  getAll(): ToolDefinition[] {
    return this.ordered;
  }

  getById(id: string): ToolDefinition | undefined {
    return this.byId.get(id);
  }

  /** Primary lookup used by the router — resolves a `/tools/:slug` param. */
  getBySlug(slug: string): ToolDefinition | undefined {
    return this.bySlug.get(slug);
  }

  getByCategory(category: ToolCategory): ToolDefinition[] {
    return this.ordered.filter((t) => t.category === category);
  }

  /** Resolves a tool's `relatedTools` ids into full ToolDefinition objects, dropping any unknown ids. */
  getRelated(tool: ToolDefinition): ToolDefinition[] {
    return tool.relatedTools
      .map((id) => this.byId.get(id))
      .filter((t): t is ToolDefinition => Boolean(t));
  }

  search(query: string): ToolDefinition[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.ordered.filter(
      (t) =>
        t.shortName.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.seo.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }

  has(slug: string): boolean {
    return this.bySlug.has(slug);
  }

  count(): number {
    return this.ordered.length;
  }
}

export const toolRegistry = new ToolRegistry(TOOL_DEFINITIONS);

// Exported for tests that want to construct isolated registries from
// custom fixtures rather than mutating the singleton above.
export { ToolRegistry };
