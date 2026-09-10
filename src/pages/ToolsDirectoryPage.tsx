import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Breadcrumb } from "../components/layout/Breadcrumb";
import { ToolCard } from "../components/tools/ToolCard";
import { AdInContent } from "../components/ads";
import { SeoHead } from "../components/seo/SeoHead";
import { CATEGORIES, CATEGORY_LABELS, type ToolCategory } from "../types/tool";
import { toolRegistry } from "../lib/toolRegistry";

export function ToolsDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") as ToolCategory | null;
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return toolRegistry.getAll().filter((t) => {
      const matchesCategory = !activeCategory || t.category === activeCategory;
      const matchesQuery =
        !query.trim() || t.shortName.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  const setCategory = (category: ToolCategory | null) => {
    if (category) setSearchParams({ category });
    else setSearchParams({});
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6">
      <SeoHead
        title="All Tools — Free PDF & Image Tools | Tier1Tools"
        description="Browse every PDF and image tool on Tier1Tools: convert, compress, merge, and extract text, all free and no account required."
        path="/tools"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "All Tools", path: "/tools" },
        ]}
      />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "All Tools" }]} />

      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-[32px]">All Tools</h1>
        <p className="max-w-2xl text-sm text-neutral-600">
          Browse every conversion, compression, merge, and OCR tool on the platform. Filter by category or search
          for the tool you need.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={`focus-ring rounded-full border px-4 py-2 text-sm font-medium ${
              !activeCategory ? "border-brand-600 bg-brand-50 text-brand-700" : "border-neutral-200 text-neutral-600 hover:border-brand-600"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setCategory(category)}
              className={`focus-ring rounded-full border px-4 py-2 text-sm font-medium ${
                activeCategory === category
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-neutral-200 text-neutral-600 hover:border-brand-600"
              }`}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools…"
          className="focus-ring h-11 w-full rounded-[var(--radius-control)] border border-neutral-200 bg-white px-4 text-sm sm:w-64"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-600">
          No tools match your search.
        </p>
      )}

      <AdInContent />
    </div>
  );
}
