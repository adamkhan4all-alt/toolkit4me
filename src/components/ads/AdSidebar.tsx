import { AdUnit } from "./AdUnit";

/**
 * Wide skyscraper (300×600), desktop-only. Meant to render inside a
 * dedicated `<aside>` column that sits beside — never inside or
 * overlapping — the main content/workspace column, per the two-column
 * tool-page layout. `sticky` keeps it in view while scrolling long tool
 * pages, but it never extends into the main column since it's confined
 * to its own flex/grid track by the parent layout, not by this
 * component positioning itself over anything.
 */
export function AdSidebar({ className }: { className?: string }) {
  return (
    <AdUnit
      placement="sidebar"
      wrapperClassName={`sticky top-20 hidden lg:block ${className ?? ""}`}
      boxClassName="h-[600px] w-[300px]"
      format="vertical"
      responsive={false}
    />
  );
}
