import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Listener = (data: Record<string, unknown>, success: boolean) => void;

/** A fake of Google's consent message (IAB TCF v2.2 __tcfapi). */
function fakeCmp() {
  const listeners: Listener[] = [];
  window.__tcfapi = (command: string, _v: number, cb: Listener) => {
    if (command === "addEventListener") listeners.push(cb as Listener);
  };
  return {
    emit(data: Record<string, unknown>) {
      for (const l of listeners) l(data, true);
    },
  };
}
const consent = (p1: boolean, google: boolean, eventStatus = "useractioncomplete") => ({
  gdprApplies: true,
  eventStatus,
  purpose: { consents: { "1": p1 } },
  vendor: { consents: { "755": google } },
});

const gaScripts = () => document.querySelectorAll('script[data-analytics="ga4"]').length;
const events = (name: string) =>
  (window.dataLayer ?? []).map((a) => Array.from(a as ArrayLike<unknown>)).filter((a) => a[0] === "event" && a[1] === name);
const consentCalls = () => (window.dataLayer ?? []).map((a) => Array.from(a as ArrayLike<unknown>)).filter((a) => a[0] === "consent");

/** Lets the region check (a resolved fetch) finish. */
const flush = async () => {
  for (let i = 0; i < 6; i++) await Promise.resolve();
};
/** Stubs /api/consent-region: true/false, or "fail" for a network error. */
function region(answer: boolean | "fail") {
  const fn = vi.fn(async () => {
    if (answer === "fail") throw new TypeError("network");
    return { ok: true, json: async () => ({ consentRequired: answer }) };
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

async function load(id = "G-TEST12345") {
  vi.resetModules();
  vi.stubEnv("VITE_GA_MEASUREMENT_ID", id);
  return import("../analytics");
}

beforeEach(() => {
  region(true);
  window.dataLayer = [];
  delete window.__tcfapi;
  document.querySelectorAll('script[data-analytics="ga4"]').forEach((s) => s.remove());
  window.history.replaceState({}, "", "/");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("analytics: configuration", () => {
  it("does nothing at all without a Measurement ID", async () => {
    const a = await load("");
    expect(a.ANALYTICS_CONFIGURED).toBe(false);
    fakeCmp();
    a.initAnalytics();
    await flush();
    a.trackPageView("https://www.toolkit4me.com/", "Home");
    expect(window.dataLayer).toEqual([]);
    expect(gaScripts()).toBe(0);
  });

  it("rejects a malformed Measurement ID", async () => {
    expect((await load("UA-123")).ANALYTICS_CONFIGURED).toBe(false);
    expect((await load("G-<script>")).ANALYTICS_CONFIGURED).toBe(false);
  });
});

describe("analytics: consent", () => {
  it("sets denied Consent Mode defaults first and loads nothing before a decision", async () => {
    const a = await load();
    const cmp = fakeCmp();
    a.initAnalytics();
    await flush();
    expect(consentCalls()[0]).toEqual(["consent", "default", expect.objectContaining({ analytics_storage: "denied", ad_storage: "denied" })]);
    a.trackPageView("https://www.toolkit4me.com/tools", "All Tools");
    cmp.emit({ ...consent(false, false, "cmpuishown") }); // banner on screen, no choice yet
    expect(gaScripts()).toBe(0);
    expect(events("page_view")).toHaveLength(0);
  });

  it("loads after EEA consent (Purpose 1 + Google) and counts the current page once", async () => {
    const a = await load();
    const cmp = fakeCmp();
    a.initAnalytics();
    await flush();
    a.trackPageView("https://www.toolkit4me.com/tools", "All Tools");
    cmp.emit(consent(true, true));
    expect(gaScripts()).toBe(1);
    expect(consentCalls().at(-1)).toEqual(["consent", "update", { analytics_storage: "granted" }]);
    expect(events("page_view")).toEqual([["event", "page_view", { page_location: "https://www.toolkit4me.com/tools", page_title: "All Tools" }]]);
    const config = (window.dataLayer ?? []).map((x) => Array.from(x as ArrayLike<unknown>)).find((x) => x[0] === "config");
    expect(config?.[2]).toEqual({ send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
  });

  it("stays off when the visitor refuses, or consents to storage but not for Google", async () => {
    const a = await load();
    const cmp = fakeCmp();
    a.initAnalytics();
    await flush();
    a.trackPageView("https://www.toolkit4me.com/", "Home");
    cmp.emit(consent(false, true));
    cmp.emit(consent(true, false));
    expect(gaScripts()).toBe(0);
    expect(events("page_view")).toHaveLength(0);
    expect(a.analyticsState()).toBe("denied");
  });

  it("loads straight away where GDPR doesn't apply", async () => {
    const a = await load();
    const cmp = fakeCmp();
    a.initAnalytics();
    await flush();
    a.trackPageView("https://www.toolkit4me.com/", "Home");
    cmp.emit({ gdprApplies: false, eventStatus: "tcloaded" });
    expect(gaScripts()).toBe(1);
    expect(events("page_view")).toHaveLength(1);
  });

  it("follows withdrawal: denies storage, stops page views, deletes _ga cookies; consenting again resumes", async () => {
    const a = await load();
    const cmp = fakeCmp();
    a.initAnalytics();
    await flush();
    cmp.emit(consent(true, true));
    a.trackPageView("https://www.toolkit4me.com/a", "A");
    document.cookie = "_ga=GA1.1.123; path=/";
    document.cookie = "_ga_TEST12345=GS1.1.1; path=/";
    document.cookie = "other=keep; path=/";
    cmp.emit(consent(false, false));
    expect(consentCalls().at(-1)).toEqual(["consent", "update", { analytics_storage: "denied" }]);
    expect(document.cookie).not.toMatch(/_ga/);
    expect(document.cookie).toContain("other=keep");
    a.trackPageView("https://www.toolkit4me.com/b", "B");
    expect(events("page_view").map((e) => (e[2] as { page_title: string }).page_title)).toEqual(["A"]);
    cmp.emit(consent(true, true));
    expect(events("page_view").map((e) => (e[2] as { page_title: string }).page_title)).toEqual(["A", "B"]);
    expect(gaScripts()).toBe(1); // never a second copy of gtag.js
  });

  it("fails closed when the consent message never appears", async () => {
    const a = await load();
    vi.useFakeTimers();
    a.initAnalytics();
    await flush();
    a.trackPageView("https://www.toolkit4me.com/", "Home");
    vi.advanceTimersByTime(11_000);
    window.__tcfapi = () => undefined; // too late
    vi.advanceTimersByTime(1_000);
    expect(a.analyticsState()).toBe("unavailable");
    expect(gaScripts()).toBe(0);
    expect(events("page_view")).toHaveLength(0);
  });
});

describe("analytics: page views", () => {
  it("sends one page view per route, never a duplicate for the same URL", async () => {
    const a = await load();
    const cmp = fakeCmp();
    a.initAnalytics();
    await flush();
    cmp.emit({ gdprApplies: false, eventStatus: "tcloaded" });
    a.trackPageView("https://www.toolkit4me.com/tools/compress-image", "Compress");
    a.trackPageView("https://www.toolkit4me.com/tools/compress-image", "Compress"); // StrictMode / re-render
    a.trackPageView("https://www.toolkit4me.com/tools/compress-image#faq", "Compress"); // hash only
    a.trackPageView("https://www.toolkit4me.com/tools/pdf-to-word", "PDF to Word");
    expect(events("page_view")).toHaveLength(2);
  });

  it("keeps only the path and utm_* campaign parameters", async () => {
    const { cleanLocation } = await load();
    expect(cleanLocation("https://www.toolkit4me.com/tools/x?q=my+secret&email=a%40b.c&utm_source=news&utm_medium=email#top")).toBe(
      "https://www.toolkit4me.com/tools/x?utm_source=news&utm_medium=email"
    );
    expect(cleanLocation("https://www.toolkit4me.com/blog?page=2")).toBe("https://www.toolkit4me.com/blog");
  });
});

describe("analytics: consent settings link", () => {
  it("re-opens Google's consent message when it's loaded, and reports when it isn't", async () => {
    const a = await load();
    delete window.googlefc;
    expect(a.openConsentSettings()).toBe(false);
    const show = vi.fn();
    window.googlefc = { callbackQueue: [], showRevocationMessage: show };
    expect(a.openConsentSettings()).toBe(true);
    for (const cb of window.googlefc.callbackQueue as (() => void)[]) cb();
    expect(show).toHaveBeenCalledOnce();
  });
});

describe("analytics: consent region", () => {
  it("outside the consent area, loads straight away even though Google's message never appears", async () => {
    const fetchFn = region(false);
    const a = await load();
    a.initAnalytics();
    a.trackPageView("https://www.toolkit4me.com/", "Home");
    await flush();
    expect(fetchFn).toHaveBeenCalledWith("/api/consent-region", expect.objectContaining({ cache: "no-store", credentials: "omit" }));
    expect(gaScripts()).toBe(1);
    expect(events("page_view")).toHaveLength(1);
  });

  it("outside the consent area, still honours a refusal if the message does appear", async () => {
    region(false);
    const a = await load();
    const cmp = fakeCmp();
    a.initAnalytics();
    await flush();
    expect(a.analyticsState()).toBe("granted");
    cmp.emit(consent(false, false));
    expect(a.analyticsState()).toBe("denied");
  });

  it("inside the consent area, waits for consent", async () => {
    region(true);
    const a = await load();
    a.initAnalytics();
    a.trackPageView("https://www.toolkit4me.com/", "Home");
    await flush();
    expect(gaScripts()).toBe(0);
    expect(a.analyticsState()).toBe("waiting");
  });

  it("treats a failed region check as 'consent required'", async () => {
    region("fail");
    const a = await load();
    a.initAnalytics();
    await flush();
    expect(gaScripts()).toBe(0);
    expect(a.analyticsState()).toBe("waiting");
  });
});
