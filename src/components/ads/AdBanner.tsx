import { AdUnit } from "./AdUnit";

/**
 * Leaderboard placement (728×90), desktop/tablet only. Intended for
 * horizontal breaks between page sections — homepage between major
 * sections, or above/below a block of informational content on a tool
 * page. Hidden below `sm` in favor of `<AdMobile>` at that size.
 */
export function AdBanner({ className }: { className?: string }) {
  return (
    <AdUnit
      placement="banner"
      wrapperClassName={`my-8 hidden sm:block ${className ?? ""}`}
      boxClassName="h-[90px] w-full max-w-[728px] mx-auto"
    />
  );
}
