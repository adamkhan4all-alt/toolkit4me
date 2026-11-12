import { lazy, Suspense, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchBar } from "./SearchBar";
import { HubMenu } from "./HubMenu";
import { toolRegistry } from "../../lib/toolRegistry";

// Lazy: MobileNav (accordion, focus trap, its own SearchBar instance) is
// only needed on screens narrow enough to hide the desktop nav, and only
// once someone actually opens it — but Header renders on every single
// page, so a static import here put that code in the main bundle for
// every visitor regardless of viewport (Lighthouse: "Reduce unused
// JavaScript"). `mobileNavMounted` below gates the *first* mount on the
// first tap of the hamburger button; once mounted it stays mounted for
// the rest of the session (matching the previous always-mounted
// behavior) so open/close and focus-restore keep working exactly as
// before on every subsequent toggle.
const MobileNav = lazy(() => import("./MobileNav").then((m) => ({ default: m.MobileNav })));

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileNavMounted, setMobileNavMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <Link to="/" className="focus-ring flex items-center gap-2 rounded text-lg font-extrabold tracking-tight text-neutral-900">
          <span aria-hidden="true" className="brand-gradient-bg inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white">T4</span>
          <span>
            Toolkit<span className="brand-gradient-text">4Me</span>
          </span>
        </Link>

        <HubMenu hubs={toolRegistry.getHubs()} />

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="focus-ring hidden h-10 w-10 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 md:flex"
            aria-label="Search tools"
            onClick={() => setSearchOpen((v) => !v)}
          >
            🔍
          </button>
          <button
            type="button"
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 md:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => {
              setMobileNavMounted(true);
              setMobileOpen(true);
            }}
          >
            ☰
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-neutral-200 bg-white px-4 py-3 sm:px-6">
          <SearchBar
            autoFocus
            onSelect={(path) => {
              setSearchOpen(false);
              navigate(path);
            }}
          />
        </div>
      )}

      {mobileNavMounted && (
        <Suspense fallback={null}>
          <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
        </Suspense>
      )}
    </header>
  );
}
