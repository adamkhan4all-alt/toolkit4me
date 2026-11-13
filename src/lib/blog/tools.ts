import { getHub } from "../../data/hubs";
import { toolRegistry } from "../toolRegistry";
import { listingPath, type ToolListing } from "../../types/tool";

export interface BlogToolInfo {
  listing: ToolListing;
  path: string;
  hubName: string;
  /** Where the work happens — stated on every recommendation so readers know before they open the tool. */
  processing: "browser" | "server";
}

/**
 * Resolves a tool or calculator id from an article to its real registry entry. Unknown ids return
 * undefined (and fail the content tests), so an article can never link to an invented route.
 */
export function blogToolInfo(id: string): BlogToolInfo | undefined {
  const listing = toolRegistry.getListings().find((t) => t.id === id);
  if (!listing) return undefined;
  const definition = toolRegistry.getById(id);
  // Calculators are listings without a ToolDefinition; every calculator runs in the browser.
  const processing = definition?.processingMode === "SERVER" ? "server" : "browser";
  return { listing, path: listingPath(listing), hubName: getHub(listing.hub).name, processing };
}

export function blogTools(ids: string[]): BlogToolInfo[] {
  return ids.map(blogToolInfo).filter((t): t is BlogToolInfo => t !== undefined);
}

export const PROCESSING_LABEL: Record<BlogToolInfo["processing"], string> = {
  browser: "Runs in your browser",
  server: "Processed on our server",
};

/** Tools featured on the blog home page: a broad, real cross-section of the site. */
export const BLOG_HOME_TOOLS = ["compress-pdf", "merge-pdf", "image-to-text", "compress-image", "protect-pdf", "blur-image-areas", "utm-builder", "profit-margin-calculator"];
