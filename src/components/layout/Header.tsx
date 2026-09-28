import { lazy, Suspense, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchBar } from "./SearchBar";
import { CATEGORIES, CATEGORY_LABELS } from "../../types/tool";

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
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <Link to="/" className="focus-ring rounded text-lg font-bold text-neutral-900">
          Toolkit4Me
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-3 lg:gap-5 md:flex overflow-x-auto">
          <Link to="/tools" className="focus-ring rounded text-sm font-medium text-neutral-600 hover:text-brand-600">
            All Tools
          </Link>
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              to={`/tools?category=${category}`}
              className="focus-ring rounded text-sm font-medium text-neutral-600 hover:text-brand-600"
            >
              {CATEGORY_LABELS[category]}
            </Link>
          ))}
        </nav>

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
            onSelect={(slug) => {
              setSearchOpen(false);
              navigate(`/tools/${slug}`);
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
