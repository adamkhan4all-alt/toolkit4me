type AdVariant = "desktop-banner" | "mobile-banner" | "rectangle" | "in-content" | "sidebar";

const dimensions: Record<AdVariant, string> = {
  "desktop-banner": "hidden sm:flex h-[90px] w-full max-w-[728px] mx-auto",
  "mobile-banner": "flex sm:hidden h-[50px] w-full max-w-[320px] mx-auto",
  rectangle: "flex h-[250px] w-full max-w-[300px] mx-auto",
  "in-content": "flex min-h-[250px] w-full",
  sidebar: "hidden lg:flex h-[600px] w-[300px] sticky top-20",
};

/**
 * Reusable ad placeholder. Renders the literal "Advertisement" label during
 * development per the UI/UX spec — never styled to resemble tool UI, and
 * never placed inside the upload/processing/result workspace.
 */
export function AdSlot({ variant }: { variant: AdVariant }) {
  return (
    <div
      className={`${dimensions[variant]} items-center justify-center rounded-md border border-dashed border-neutral-200 bg-neutral-100 text-xs font-medium text-neutral-400`}
      aria-hidden="true"
    >
      Advertisement
    </div>
  );
}
