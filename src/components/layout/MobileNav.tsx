import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toolRegistry } from "../../lib/toolRegistry";
import { CATEGORIES, CATEGORY_LABELS } from "../../types/tool";
import { SearchBar } from "./SearchBar";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const navigate = useNavigate();

  // Move focus into the panel on open, restore it to whatever triggered
  // the menu on close — without this, keyboard/screen-reader users lose
  // their place entirely when the overlay opens or closes.
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
      closeButtonRef.current?.focus();
    } else if (triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus();
    }
  }, [open]);

  // Escape closes the menu; Tab is trapped inside the panel so focus can
  // never land on content behind the overlay while it's open.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Prevent the page behind the drawer from scrolling while it's open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-[var(--color-overlay,rgba(17,24,39,0.5))]" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col overflow-y-auto bg-white p-5 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-lg font-bold text-neutral-900">Menu</span>
          <button
            ref={closeButtonRef}
            type="button"
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100"
            aria-label="Close menu"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <SearchBar
            onSelect={(slug) => {
              onClose();
              navigate(`/tools/${slug}`);
            }}
          />
        </div>

        <Link
          to="/tools"
          onClick={onClose}
          className="focus-ring rounded-md px-2 py-3 text-base font-semibold text-neutral-900 hover:bg-neutral-100"
        >
          All Tools
        </Link>

        <div className="mt-2 flex flex-col divide-y divide-neutral-200 border-t border-neutral-200">
          {CATEGORIES.map((category) => {
            const tools = toolRegistry.getByCategory(category);
            const isOpen = expanded === category;
            return (
              <div key={category}>
                <button
                  type="button"
                  className="focus-ring flex w-full items-center justify-between rounded-md px-2 py-3 text-left text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? null : category)}
                >
                  {CATEGORY_LABELS[category]}
                  <span aria-hidden="true" className="text-neutral-400">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="flex flex-col pb-2 pl-2">
                    {tools.map((tool) => (
                      <Link
                        key={tool.slug}
                        to={`/tools/${tool.slug}`}
                        onClick={onClose}
                        className="focus-ring rounded-md px-2 py-2 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-brand-600"
                      >
                        {tool.shortName}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
