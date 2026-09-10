// ---------------------------------------------------------------------
// Single source of truth for all AdSense configuration. Nothing outside
// this file may reference a publisher ID, ad slot ID, or the "are ads
// on" flag directly — every ad component reads through here, so turning
// ads on/off or rotating a slot ID is a one-line env change, never a
// code change scattered across pages.
//
// All values come from Vite env vars (build-time, `VITE_`-prefixed per
// Vite's convention). See .env.example for the full list and comments.
// ---------------------------------------------------------------------

/**
 * Master switch. Defaults to OFF so a fresh checkout, a local dev server,
 * and CI never render (or attempt to load) real ad markup/scripts unless
 * someone explicitly opts in. This is the one flag `npm run dev` needs to
 * leave untouched to keep local development ad-free.
 */
export const ADS_ENABLED: boolean = import.meta.env.VITE_ADS_ENABLED === "true";

/** AdSense publisher/client ID, e.g. "ca-pub-XXXXXXXXXXXXXXXX". Never hard-coded elsewhere. */
export const ADSENSE_CLIENT_ID: string = import.meta.env.VITE_ADSENSE_CLIENT_ID ?? "";

/** Per-placement ad unit (slot) IDs, configured independently so each placement can be tuned/reported on separately in AdSense. */
export const AD_SLOT_IDS = {
  banner: import.meta.env.VITE_AD_SLOT_BANNER ?? "",
  rectangle: import.meta.env.VITE_AD_SLOT_RECTANGLE ?? "",
  sidebar: import.meta.env.VITE_AD_SLOT_SIDEBAR ?? "",
  mobile: import.meta.env.VITE_AD_SLOT_MOBILE ?? "",
  inContent: import.meta.env.VITE_AD_SLOT_IN_CONTENT ?? "",
} as const;

export type AdPlacement = keyof typeof AD_SLOT_IDS;

/**
 * Whether a *real* ad can actually be requested for a given placement:
 * the master switch is on, a publisher ID is configured, AND that
 * specific placement has its own slot ID set. Any one of those being
 * missing falls back to the development placeholder rather than
 * rendering broken/empty AdSense markup — see AdUnit.tsx.
 */
export function isAdReady(placement: AdPlacement): boolean {
  return ADS_ENABLED && ADSENSE_CLIENT_ID.length > 0 && AD_SLOT_IDS[placement].length > 0;
}
