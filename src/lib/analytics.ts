// ---------------------------------------------------------------------
// Google Analytics 4, gated on the site's existing consent message.
//
// The consent banner is Google's own CMP (AdSense "Privacy & messaging"),
// loaded by the AdSense script. It implements IAB TCF v2.2 and exposes
// window.__tcfapi. This module never shows its own banner; it reads that
// one and fails closed:
//
//   * Nothing loads unless VITE_GA_MEASUREMENT_ID is set (the only place
//     the ID is read).
//   * Where prior consent is required (EEA, UK, Switzerland — decided by
//     /api/consent-region from Vercel's geolocation; unknown counts as
//     required), gtag.js is downloaded only after the visitor consents in
//     the CMP to TCF Purpose 1 (store/access information on a device) for
//     Google (vendor 755). If the CMP never appears (blocked, failed),
//     Analytics never loads. Elsewhere it loads straight away; Google only
//     shows its message in the consent area, so it can't decide this.
//   * Consent changes are followed: withdrawal sets analytics_storage to
//     denied, stops page views and deletes the _ga cookies.
//   * Page views are sent manually (send_page_view: false), once per route,
//     so there is exactly one per navigation. In the GA4 stream, turn OFF
//     Enhanced measurement → "Page changes based on browser history events",
//     or that would send a second one.
//   * No personal data: page_location keeps only the path and utm_*
//     campaign parameters, Google signals and ad personalisation are off,
//     and no tool input, file name or file content is ever sent.
// ---------------------------------------------------------------------

const MEASUREMENT_ID = (import.meta.env?.VITE_GA_MEASUREMENT_ID ?? "").trim();

/**
 * True when a GA4 Measurement ID is configured for this build: "G-" + 10 letters/digits (Admin → Data streams → the
 * stream → Measurement ID). An 11-digit Stream ID ("G-12345678901") is a common mix-up and is rejected, so the
 * build has Analytics off rather than sending to nowhere.
 */
export const ANALYTICS_CONFIGURED = /^G-[A-Z0-9]{10}$/.test(MEASUREMENT_ID);

/** Google's IAB TCF vendor id. */
const GOOGLE_VENDOR_ID = 755;
/** How long to wait for the consent message's API before giving up (fail closed). */
const CMP_WAIT_MS = 10_000;
const CMP_POLL_MS = 250;
/** Vercel Function that answers whether this visitor's region needs prior consent (api/consent-region.ts). */
const REGION_ENDPOINT = "/api/consent-region";

interface TcData {
  gdprApplies?: boolean;
  eventStatus?: "tcloaded" | "cmpuishown" | "useractioncomplete";
  purpose?: { consents?: Record<string, boolean> };
  vendor?: { consents?: Record<string, boolean> };
}
type TcfApi = (command: string, version: number, callback: (data: TcData, success: boolean) => void, parameter?: unknown) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    __tcfapi?: TcfApi;
    googlefc?: { callbackQueue?: unknown[]; showRevocationMessage?: () => void };
  }
}

type State = "off" | "waiting" | "granted" | "denied" | "unavailable";
let state: State = "off";
let scriptLoaded = false;
let lastSentKey: string | null = null;
/** The page on screen, so it can be counted the moment consent is given. */
let current: { location: string; title: string } | null = null;

/** gtag must push the `arguments` object itself, not an array copy. */
function gtag(..._args: unknown[]): void {
  // eslint-disable-next-line prefer-rest-params
  (window.dataLayer = window.dataLayer || []).push(arguments);
}

/** The analytics decision for one TCF state. */
export function analyticsAllowed(tc: TcData): boolean {
  if (tc.gdprApplies === false) return true;
  return tc.purpose?.consents?.["1"] === true && tc.vendor?.consents?.[String(GOOGLE_VENDOR_ID)] === true;
}

/** Page URL without query or hash, except utm_* campaign parameters (they carry no personal data). */
export function cleanLocation(href: string): string {
  const u = new URL(href);
  const keep = new URLSearchParams();
  for (const [k, v] of u.searchParams) if (/^utm_(source|medium|campaign|term|content|id)$/.test(k)) keep.set(k, v);
  const qs = keep.toString();
  return `${u.origin}${u.pathname}${qs ? `?${qs}` : ""}`;
}

function loadScript(): void {
  if (scriptLoaded) return;
  scriptLoaded = true;
  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  s.dataset.analytics = "ga4";
  s.onerror = () => undefined; // blocked by an extension: the site carries on without analytics
  document.head.appendChild(s);
}

function deleteGaCookies(): void {
  const host = location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0]?.trim();
    if (!name || !/^_ga(_|$)/.test(name)) continue;
    for (const d of domains) document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
  }
}

/** Google's documented switch that stops all measurement by an already-loaded tag (not only cookies). */
function setDisabled(disabled: boolean): void {
  (window as unknown as Record<string, unknown>)[`ga-disable-${MEASUREMENT_ID}`] = disabled;
}

function grant(): void {
  if (state === "granted") return;
  state = "granted";
  setDisabled(false);
  gtag("consent", "update", { analytics_storage: "granted" });
  loadScript();
  if (current) send(current.location, current.title);
}

function deny(): void {
  const wasGranted = state === "granted";
  state = "denied";
  // Belt and braces: a loaded gtag.js would otherwise keep sending cookieless pings for its own automatic events.
  setDisabled(true);
  if (scriptLoaded) gtag("consent", "update", { analytics_storage: "denied" });
  if (wasGranted) {
    deleteGaCookies();
    lastSentKey = null;
  }
}

function send(pageLocation: string, title: string): void {
  if (pageLocation === lastSentKey) return; // one page view per route, even if called twice
  lastSentKey = pageLocation;
  gtag("event", "page_view", { page_location: pageLocation, page_title: title });
}

/** Starts listening to the consent message. Call once at startup; a no-op without a Measurement ID. */
export function initAnalytics(): void {
  if (!ANALYTICS_CONFIGURED || typeof window === "undefined" || state !== "off") return;
  state = "waiting";
  // Consent Mode defaults, before anything else reaches the dataLayer: no storage until the CMP says otherwise.
  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  // Is prior consent needed for this visitor? Only /api/consent-region knows the country (EEA, UK, Switzerland →
  // yes). Google's consent message is only served in that area, so it can't answer this itself. Any failure → yes.
  void fetch(REGION_ENDPOINT, { cache: "no-store", credentials: "omit" })
    .then((r) => (r.ok ? (r.json() as Promise<{ consentRequired?: unknown }>) : null))
    .catch(() => null)
    .then((body) => {
      const required = body?.consentRequired !== false;
      if (!required) grant();
      listenToConsentMessage(required);
    });
}

/**
 * Follows Google's consent message (IAB TCF). Where consent is required, nothing loads until it says yes, and if it
 * never appears Analytics stays off. Elsewhere it is still honoured if it appears (for example a visitor whose
 * location was misjudged and who is shown the message and refuses).
 */
function listenToConsentMessage(required: boolean): void {
  const started = Date.now();
  const attach = () => {
    const api = window.__tcfapi;
    if (typeof api !== "function") {
      if (Date.now() - started >= CMP_WAIT_MS) {
        if (required) state = "unavailable"; // no consent signal: never load
        return;
      }
      window.setTimeout(attach, CMP_POLL_MS);
      return;
    }
    try {
      api("addEventListener", 2, (tc, success) => {
        if (!success) return;
        // While the message is on screen the visitor hasn't decided yet.
        if (tc.gdprApplies !== false && tc.eventStatus === "cmpuishown") return;
        if (analyticsAllowed(tc)) grant();
        else deny();
      });
    } catch {
      if (required) state = "unavailable";
    }
  };
  attach();
}

/** Records one page view for the current URL, now or once consent is given. Called by <AnalyticsTracker>. */
export function trackPageView(href: string, title: string): void {
  if (!ANALYTICS_CONFIGURED) return;
  current = { location: cleanLocation(href), title };
  if (state === "granted") send(current.location, current.title);
}

/**
 * Re-opens Google's consent message so a visitor can change or withdraw consent (for ads and analytics alike).
 * Returns false when the message isn't available (blocked, or not loaded), so the caller can fall back to the policy.
 */
export function openConsentSettings(): boolean {
  const fc = window.googlefc;
  if (!fc || !Array.isArray(fc.callbackQueue)) return false;
  fc.callbackQueue.push(() => window.googlefc?.showRevocationMessage?.());
  return true;
}

/** Test hook: current consent state. */
export const analyticsState = (): State => state;

/** Test hook: forget all module state. */
export function resetAnalyticsForTests(): void {
  state = "off";
  scriptLoaded = false;
  lastSentKey = null;
  current = null;
}
