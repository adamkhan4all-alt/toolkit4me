import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Breadcrumb } from "../components/layout/Breadcrumb";
import { ToolCard } from "../components/tools/ToolCard";
import { AdInContent } from "../components/ads";
import { SeoHead } from "../components/seo/SeoHead";
import { CATEGORY_LABELS, listingPath, type ToolCategory, type ToolDefinition, type ToolListing } from "../types/tool";
import type { HubId } from "../data/hubs";
import { toolRegistry } from "../lib/toolRegistry";
import { TOOLS_PAGE_DESCRIPTION, TOOLS_PAGE_TITLE, toolsPageIntro } from "../config/site";

const chip = (active: boolean) =>
  `focus-ring rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
    active ? "border-brand-600 bg-brand-50 text-brand-700" : "border-neutral-200 bg-white text-neutral-600 hover:border-brand-100 hover:text-neutral-900"
  }`;

/**
 * The full directory. Filters live in the URL (?hub=pdf&category=security)
 * so filtered views can be shared and the back button works; the older
 * ?category= links (e.g. from the About page) keep working on their own.
 */
export function ToolsDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const hubs = toolRegistry.getHubs();
  const hubParam = searchParams.get("hub");
  const activeHub = hubs.find((h) => h.id === hubParam) ?? null;
  const activeCategory = searchParams.get("category") as ToolCategory | null;
  const [query, setQuery] = useState("");

  const activeHubId = activeHub?.id ?? null;
  // Plain derivations: the registry is small, so no memoisation is needed.
  const inHub = activeHubId ? toolRegistry.getListingsByHub(activeHubId) : toolRegistry.getListings();
  // Sub-category chips come from full tool definitions; calculators are grouped by their hub instead.
  const categoryOf = (t: ToolListing): ToolCategory | null => ("category" in t ? (t as ToolDefinition).category : null);
  const subcategories = [...new Set(inHub.map(categoryOf).filter((c): c is ToolCategory => c !== null))];
  const matches = query.trim() ? new Set(toolRegistry.searchListings(query).map(listingPath)) : null;
  const filtered = inHub.filter((t) => (!activeCategory || categoryOf(t) === activeCategory) && (!matches || matches.has(listingPath(t))));

  const setFilters = (hub: HubId | null, category: ToolCategory | null) => {
    const next: Record<string, string> = {};
    if (hub) next.hub = hub;
    if (category) next.category = category;
    setSearchParams(next);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6">
      <SeoHead
        title={TOOLS_PAGE_TITLE}
        description={TOOLS_PAGE_DESCRIPTION}
        path="/tools"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "All Tools", path: "/tools" },
        ]}
      />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "All Tools" }]} />

      <div className="flex flex-col gap-3">
        <h1 className="text-[32px] leading-tight font-extrabold tracking-tight text-neutral-900 sm:text-[40px]">All Tools</h1>
        <p className="max-w-2xl text-sm leading-6 text-neutral-600">{toolsPageIntro(toolRegistry.countListings())}</p>
      </div>

      <div className="flex flex-col gap-4">
        <label className="sr-only" htmlFor="directory-search">
          Search tools
        </label>
        <input
          id="directory-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools — e.g. compress, QR, word count…"
          className="focus-ring h-12 w-full rounded-[var(--radius-control)] border border-neutral-200 bg-white px-4 text-sm shadow-[var(--shadow-card)] sm:max-w-md"
        />

        <div role="group" aria-label="Filter by section" className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={!activeHub} onClick={() => setFilters(null, null)} className={chip(!activeHub)}>
            All
          </button>
          {hubs.map((hub) => (
            <button key={hub.id} type="button" aria-pressed={activeHub?.id === hub.id} onClick={() => setFilters(hub.id, null)} className={chip(activeHub?.id === hub.id)}>
              {hub.name}
            </button>
          ))}
        </div>

        {subcategories.length > 1 && (
          <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={!activeCategory} onClick={() => setFilters(activeHub?.id ?? null, null)} className={`${chip(!activeCategory)} px-3 py-1.5 text-xs`}>
              Any type
            </button>
            {subcategories.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={activeCategory === category}
                onClick={() => setFilters(activeHub?.id ?? null, category)}
                className={`${chip(activeCategory === category)} px-3 py-1.5 text-xs`}
              >
                {CATEGORY_LABELS[category]}
              </button>
            ))}
          </div>
        )}
      </div>

      <p aria-live="polite" className="-mb-4 text-sm text-neutral-600">
        {filtered.length} {filtered.length === 1 ? "tool" : "tools"}
        {activeHub && (
          <>
            {" "}
            in{" "}
            <Link to={activeHub.path} className="font-semibold text-brand-700 underline">
              {activeHub.name}
            </Link>
          </>
        )}
      </p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {filtered.map((tool) => (
            <ToolCard key={listingPath(tool)} tool={tool} />
          ))}
        </div>
      ) : (
        <p className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-600">
          No tools match your search. Try a shorter word, or{" "}
          <button
            type="button"
            className="font-semibold text-brand-700 underline"
            onClick={() => {
              setQuery("");
              setFilters(null, null);
            }}
          >
            clear the filters
          </button>
          .
        </p>
      )}

      <AdInContent />
    </div>
  );
}
