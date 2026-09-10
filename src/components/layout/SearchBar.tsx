import { useMemo, useState } from "react";
import { toolRegistry } from "../../lib/toolRegistry";

interface SearchBarProps {
  onSelect: (slug: string) => void;
  autoFocus?: boolean;
  large?: boolean;
}

export function SearchBar({ onSelect, autoFocus, large }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const matches = useMemo(() => {
    return toolRegistry.search(query).slice(0, 6);
  }, [query]);

  return (
    <div className="relative w-full">
      <label htmlFor="tool-search" className="sr-only">
        What do you want to do?
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
        >
          🔍
        </span>
        <input
          id="tool-search"
          type="text"
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
          placeholder="What do you want to do?"
          className={`focus-ring w-full rounded-full border border-neutral-200 bg-white pl-11 pr-4 text-neutral-900 placeholder:text-neutral-400 ${
            large ? "h-14 text-base" : "h-11 text-sm"
          }`}
        />
      </div>

      {focused && matches.length > 0 && (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
          {matches.map((tool) => (
            <li key={tool.slug}>
              <button
                type="button"
                onMouseDown={() => onSelect(tool.slug)}
                className="focus-ring flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left hover:bg-neutral-100"
              >
                <span className="text-sm font-semibold text-neutral-900">{tool.shortName}</span>
                <span className="text-xs text-neutral-600">{tool.description}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
