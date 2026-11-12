import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { HubDefinition } from "../../data/hubs";
import { toolRegistry } from "../../lib/toolRegistry";

/**
 * Desktop navigation: one disclosure button per released hub. The panel
 * lists that hub's tools and links to its landing page. Opens on click
 * (and on hover for mouse users), closes on Escape, outside click or
 * navigation — keyboard and screen-reader users get a normal button with
 * aria-expanded, not a hover-only menu.
 */
export function HubMenu({ hubs }: { hubs: HubDefinition[] }) {
  // The open menu is remembered together with the page it was opened on, so navigating closes it without an effect.
  const [openState, setOpenState] = useState<{ hub: string; path: string } | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const open = openState && openState.path === location.pathname ? openState.hub : null;
  const setOpen = (hub: string | null) => setOpenState(hub ? { hub, path: location.pathname } : null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const button = navRef.current?.querySelector<HTMLButtonElement>(`[data-hub="${open}"]`);
        setOpenState(null);
        button?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenState(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <nav ref={navRef} aria-label="Primary" className="hidden items-center gap-1 md:flex" onMouseLeave={() => setOpen(null)}>
      {hubs.map((hub) => {
        const isOpen = open === hub.id;
        const tools = toolRegistry.getByHub(hub.id);
        const active = location.pathname === hub.path || tools.some((t) => location.pathname === `/tools/${t.slug}`);
        return (
          <div key={hub.id} className="relative" onMouseEnter={() => setOpen(hub.id)}>
            <button
              type="button"
              data-hub={hub.id}
              aria-expanded={isOpen}
              aria-controls={`hub-menu-${hub.id}`}
              onClick={() => setOpen(isOpen ? null : hub.id)}
              className={`focus-ring flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors lg:px-3 ${
                active ? "text-brand-700" : "text-neutral-600 hover:text-neutral-900"
              } ${isOpen ? "bg-neutral-100" : ""}`}
            >
              {hub.name}
              <span aria-hidden="true" className={`text-[10px] transition-transform ${isOpen ? "rotate-180" : ""}`}>
                ▾
              </span>
            </button>
            {isOpen && (
              <div
                id={`hub-menu-${hub.id}`}
                className="animate-fade-up absolute left-0 top-full z-50 mt-1 w-[min(560px,80vw)] rounded-[var(--radius-card)] border border-neutral-200 bg-white p-4 shadow-[var(--shadow-card-hover)]"
              >
                <div className="mb-3 flex items-start justify-between gap-4 border-b border-neutral-200 pb-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{hub.name}</p>
                    <p className="text-xs text-neutral-600">{hub.tagline}</p>
                  </div>
                  <Link to={hub.path} className="focus-ring shrink-0 rounded text-xs font-semibold text-brand-700 hover:underline">
                    View all {tools.length} →
                  </Link>
                </div>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {tools.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        to={`/tools/${tool.slug}`}
                        className="focus-ring flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-brand-700"
                      >
                        <span aria-hidden="true" className={`inline-flex min-w-9 justify-center rounded px-1 text-[10px] font-bold ${hub.accent}`}>
                          {tool.icon}
                        </span>
                        <span className="truncate">{tool.shortName}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
      <Link to="/tools" className="focus-ring rounded-lg px-2.5 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 lg:px-3">
        All Tools
      </Link>
      <Link to="/guides" className="focus-ring rounded-lg px-2.5 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 lg:px-3">
        Guides
      </Link>
    </nav>
  );
}
