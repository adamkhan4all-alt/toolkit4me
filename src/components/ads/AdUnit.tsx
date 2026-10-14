import { useEffect } from "react";
import { AD_SLOT_IDS, ADSENSE_CLIENT_ID, isAdReady, type AdPlacement } from "../../config/ads";
import { ensureAdSenseScript, requestAdFill } from "../../lib/adsense";

export interface AdUnitProps {
  placement: AdPlacement;
  /** Sizing/visibility classes for the ad box itself — each of the 5 exported components supplies its own fixed/responsive dimensions here so layout space is always reserved up front (no CLS on ad load). */
  boxClassName: string;
  /** Outer wrapper classes — controls spacing from surrounding content. Every exported component sets a safe default margin so an ad can never end up flush against a button or control by accident. */
  wrapperClassName?: string;
  /** AdSense `data-ad-format`. "auto" + full-width-responsive suits fluid placements (in-content); fixed-size placements (banner/rectangle/sidebar/mobile) don't need it. */
  format?: string;
  responsive?: boolean;
}

/**
 * Shared rendering core for every ad placement on the platform. Not used
 * directly outside this folder — AdBanner / AdRectangle / AdSidebar /
 * AdMobile / AdInContent are the public API, each a thin, named wrapper
 * around this with its own fixed dimensions and default spacing.
 *
 * Responsibilities kept in exactly one place so every placement behaves
 * consistently:
 *   - reads config only from src/config/ads.ts — no publisher/slot ID is
 *     ever hard-coded in a page or component
 *   - renders a real AdSense unit only when that placement is fully
 *     configured (isAdReady) and the master switch is on; otherwise
 *     nothing at all in production (see the early return below), or a
 *     clearly-labeled, non-interactive placeholder in local dev only
 *   - the ad box itself is non-interactive chrome (dashed border, muted
 *     background) in dev, and a neutral bordered frame around the real
 *     unit in production — neither is ever styled with the app's
 *     button/CTA treatment (brand color fill, pill shape, download/
 *     upload iconography), so an ad can never be mistaken for app UI
 *   - fixed/reserved box dimensions per placement prevent layout shift
 *     once a real ad fills
 */
export function AdUnit({ placement, boxClassName, wrapperClassName = "my-8", format = "auto", responsive = true }: AdUnitProps) {
  const ready = isAdReady(placement);

  useEffect(() => {
    if (!ready) return;
    ensureAdSenseScript();
    // Defer to the next tick so the <ins> element is guaranteed to be in
    // the DOM before AdSense's script looks for it.
    const id = window.setTimeout(() => requestAdFill(), 0);
    return () => window.clearTimeout(id);
  }, [ready]);

  // In production, render nothing at all until this placement has a real
  // ad slot configured. An empty, dashed "Ad space — banner" box labeled
  // "ADVERTISEMENT" was visible on every page of the live site the whole
  // time AdSense approval was pending (no VITE_AD_SLOT_* is set yet) —
  // exactly the kind of unfinished-looking placeholder a site-quality
  // review flags, and twice in a row did. Still shown in local dev
  // (`import.meta.env.DEV`) so the reserved layout space stays visible
  // while building a new placement.
  if (!ready && !import.meta.env.DEV) return null;

  return (
    <div className={wrapperClassName} data-ad-placement={placement}>
      <div className="flex flex-col items-center gap-1.5">
        <span
          className="text-[10px] font-medium tracking-wide text-neutral-600 uppercase select-none"
          aria-hidden="true"
        >
          Advertisement
        </span>
        <div
          className={`${boxClassName} flex items-center justify-center overflow-hidden rounded-md bg-neutral-50 ${
            ready ? "border border-neutral-200" : "border border-dashed border-neutral-300"
          }`}
        >
          {ready ? (
            <ins
              className="adsbygoogle block h-full w-full"
              style={{ display: "block" }}
              data-ad-client={ADSENSE_CLIENT_ID}
              data-ad-slot={AD_SLOT_IDS[placement]}
              data-ad-format={format}
              data-full-width-responsive={responsive ? "true" : "false"}
            />
          ) : (
            <span className="px-3 text-center text-xs font-medium text-neutral-600 select-none" aria-hidden="true">
              Ad space — {placement}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
