// ---------------------------------------------------------------------
// Loads Google's AdSense script exactly once, only when ads are actually
// enabled and configured (src/config/ads.ts). Nothing in local dev or a
// build with ads disabled ever fetches this script — it's not just
// hidden, it's never requested.
// ---------------------------------------------------------------------

import { ADSENSE_CLIENT_ID, ADS_ENABLED } from "../config/ads";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

let scriptInjected = false;

/** Injects the AdSense loader script into <head> once per page load. Safe to call repeatedly — no-ops after the first successful call. */
export function ensureAdSenseScript(): void {
  if (scriptInjected || !ADS_ENABLED || !ADSENSE_CLIENT_ID) return;
  if (document.querySelector('script[data-adsbygoogle-loader="true"]')) {
    scriptInjected = true;
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT_ID)}`;
  script.crossOrigin = "anonymous";
  script.dataset.adsbygoogleLoader = "true";
  document.head.appendChild(script);
  scriptInjected = true;
}

/** Requests an ad fill for one already-mounted `<ins class="adsbygoogle">` element. Failures are swallowed — a blocked/ad-blocker-stripped request must never surface as an app error. */
export function requestAdFill(): void {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch {
    // Ad blockers commonly remove `adsbygoogle` or throw here — this is
    // expected and must never break the surrounding page.
  }
}
