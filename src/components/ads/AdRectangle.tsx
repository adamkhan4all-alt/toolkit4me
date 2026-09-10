import { AdUnit } from "./AdUnit";

/**
 * Medium rectangle (300×250), any breakpoint. A general-purpose block
 * placement for a single spot between two sections — e.g. inside the
 * "About this tool" / supported-formats content area, well clear of the
 * upload workspace and any process/download controls.
 */
export function AdRectangle({ className }: { className?: string }) {
  return (
    <AdUnit
      placement="rectangle"
      wrapperClassName={`my-8 ${className ?? ""}`}
      boxClassName="h-[250px] w-full max-w-[300px] mx-auto"
      format="rectangle"
      responsive={false}
    />
  );
}
