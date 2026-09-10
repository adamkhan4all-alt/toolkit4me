import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MobileNav } from "./MobileNav";
import { SearchBar } from "./SearchBar";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <Link to="/" className="focus-ring rounded text-lg font-bold text-neutral-900">
          Tier1<span className="text-brand-600">Tools</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          <Link to="/tools" className="focus-ring rounded text-sm font-medium text-neutral-600 hover:text-brand-600">
            All Tools
          </Link>
          <Link
            to="/tools?category=convert"
            className="focus-ring rounded text-sm font-medium text-neutral-600 hover:text-brand-600"
          >
            Convert
          </Link>
          <Link
            to="/tools?category=compress"
            className="focus-ring rounded text-sm font-medium text-neutral-600 hover:text-brand-600"
          >
            Compress
          </Link>
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
            onClick={() => setMobileOpen(true)}
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

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
