import { AdUnit } from "./AdUnit";

/**
 * Fluid, full-width responsive unit for breaks between long-form content
 * sections (homepage section breaks; tool-page breaks between
 * informational sections like "How it works" / "Supported formats" /
 * "Privacy & security"). Reserves a minimum height up front regardless of
 * viewport so there's no layout shift once a real ad fills in.
 */
export function AdInContent({ className }: { className?: string }) {
  return (
    <AdUnit
      placement="inContent"
      wrapperClassName={`my-8 ${className ?? ""}`}
      boxClassName="min-h-[100px] sm:min-h-[250px] w-full"
      format="auto"
      responsive
    />
  );
}
