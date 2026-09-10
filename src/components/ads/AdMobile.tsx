import { AdUnit } from "./AdUnit";

/**
 * Compact mobile banner (320×50), visible only below `sm`. Deliberately
 * small and always rendered in normal document flow — never `fixed` or
 * `sticky` — so it can't dock itself over the upload area, the process
 * button, or a result/download button while a user is mid-task on a
 * small screen. Placement in each page decides *where* in the flow this
 * sits; this component only guarantees it never overlays anything.
 */
export function AdMobile({ className }: { className?: string }) {
  return (
    <AdUnit
      placement="mobile"
      wrapperClassName={`my-6 flex sm:hidden ${className ?? ""}`}
      boxClassName="h-[50px] w-full max-w-[320px] mx-auto"
      responsive={false}
    />
  );
}
