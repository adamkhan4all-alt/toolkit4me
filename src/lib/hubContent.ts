import { GUIDE_INDEX } from "../data/guideIndex.generated";
import type { HubDefinition } from "../data/hubs";
import type { ToolListing } from "../types/tool";

/** How many guides a hub page lists before linking to the full guides index. */
export const HUB_GUIDE_LIMIT = 8;

/** A hub's tools grouped by their sub-category label, in registry order. */
export function hubGroups<T extends ToolListing>(tools: T[]): { label: string; tools: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const tool of tools) groups.set(tool.categoryLabel, [...(groups.get(tool.categoryLabel) ?? []), tool]);
  return [...groups].map(([label, items]) => ({ label, tools: items }));
}

/** Guides listed on a hub page: those in the hub's guide categories, newest content order preserved. */
export function hubGuides(hub: HubDefinition) {
  return GUIDE_INDEX.filter((g) => hub.guideCategories.includes(g.category)).slice(0, HUB_GUIDE_LIMIT);
}
