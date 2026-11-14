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

/** Every gtag command as an array, in order. */
const commands = () => (window.dataLayer ?? []).map((a) => Array.from(a as ArrayLike<unknown>));
/** Puts the test page at `path` (what the browser shows) and returns its URL, as <AnalyticsTracker> would report it. */
const at = (path: string) => {
  window.history.replaceState({}, "", path);
  return window.location.href;
};
/**
 * The Google tag sends its own page_view when it loads (GA4 can't turn "Page loads" off), using the page_location
 * queued before gtag('js'). That hit never appears in the dataLayer, so tests check what it will use.
 */
const automaticPageLocation = () => {
  const cmds = commands();
  const js = cmds.findIndex((c) => c[0] === "js");
  const set = cmds.findIndex((c) => c[0] === "set" && (c[1] as { page_location?: string })?.page_location !== undefined);
  return js > set && set >= 0 ? (cmds[set][1] as { page_location: string }).page_location : null;
};

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

async function load(id = "G-TEST123456") {
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
    // A Stream ID pasted with "G-" in front (11 digits) is the classic mix-up.
    expect((await load("G-16337472788")).ANALYTICS_CONFIGURED).toBe(false);
    expect((await load("G-AB12CD34EF")).ANALYTICS_CONFIGURED).toBe(true);
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

  it("loads after EEA consent (Purpose 1 + Google) and counts the current page once, via the tag's own page view", async () => {
    const a = await load();
    const cmp = fakeCmp();
    a.initAnalytics();
    await flush();
    a.trackPageView(at("/tools?q=secret&utm_source=news"), "All Tools");
    cmp.emit(consent(true, true));
    expect(gaScripts()).toBe(1);
    expect(consentCalls().at(-1)).toEqual(["consent", "update", { analytics_storage: "granted" }]);
    // The tag's automatic page_view counts this page, with the cleaned address queued before it starts...
    expect(automaticPageLocation()).toBe(`${window.location.origin}/tools?utm_source=news`);
    // ...so the site sends no second one, even when the tracker reports the page again.
    a.trackPageView(window.location.href, "All Tools");
    expect(events("page_view")).toHaveLength(0);
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
    a.trackPageView(at("/"), "Home");
    cmp.emit({ gdprApplies: false, eventStatus: "tcloaded" });
    expect(gaScripts()).toBe(1);
    expect(automaticPageLocation()).toBe(`${window.location.origin}/`);
    expect(events("page_view")).toHaveLength(0); // the tag's automatic page_view covers the first page
  });

  it("follows withdrawal: denies storage, stops page views, deletes _ga cookies; consenting again resumes", async () => {
    const a = await load();
    const cmp = fakeCmp();
    a.initAnalytics();
    await flush();
    a.trackPageView(at("/a"), "A");
    cmp.emit(consent(true, true)); // page A: counted by the tag's automatic page_view
    expect(automaticPageLocation()).toBe(`${window.location.origin}/a`);
    document.cookie = "_ga=GA1.1.123; path=/";
    document.cookie = "_ga_TEST123456=GS1.1.1; path=/";
    document.cookie = "other=keep; path=/";
    cmp.emit(consent(false, false));
    expect(consentCalls().at(-1)).toEqual(["consent", "update", { analytics_storage: "denied" }]);
    expect((window as unknown as Record<string, unknown>)["ga-disable-G-TEST123456"]).toBe(true); // hard stop for the loaded tag
    expect(document.cookie).not.toMatch(/_ga/);
    expect(document.cookie).toContain("other=keep");
    a.trackPageView(at("/b"), "B"); // withdrawn: not counted
    expect(events("page_view")).toHaveLength(0);
    cmp.emit(consent(true, true)); // re-consent: the tag is already loaded, so exactly one manual page_view for B
    expect(events("page_view")).toEqual([["event", "page_view", { page_location: `${window.location.origin}/b`, page_title: "B" }]]);
    cmp.emit(consent(true, true)); // a repeated "yes" adds nothing
    expect(events("page_view")).toHaveLength(1);
    expect((window as unknown as Record<string, unknown>)["ga-disable-G-TEST123456"]).toBe(false);
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
    a.trackPageView(at("/"), "Home");
    cmp.emit({ gdprApplies: false, eventStatus: "tcloaded" }); // first page: the tag's own page_view
    a.trackPageView(at("/"), "Home"); // tracker reports the first page again: nothing
    a.trackPageView(at("/tools/compress-image"), "Compress");
    a.trackPageView(at("/tools/compress-image"), "Compress"); // StrictMode / re-render
    a.trackPageView(at("/tools/compress-image#faq"), "Compress"); // hash only
    a.trackPageView(at("/tools/pdf-to-word"), "PDF to Word");
    expect(events("page_view").map((e) => (e[2] as { page_title: string }).page_title)).toEqual(["Compress", "PDF to Word"]);
  });

  it("back and forward count once per page display", async () => {
    const a = await load();
    const cmp = fakeCmp();
    a.initAnalytics();
    await flush();
    a.trackPageView(at("/a"), "A");
    cmp.emit({ gdprApplies: false, eventStatus: "tcloaded" }); // A: automatic
    a.trackPageView(at("/b"), "B");
    a.trackPageView(at("/a"), "A"); // back
    a.trackPageView(at("/b"), "B"); // forward
    expect(events("page_view").map((e) => (e[2] as { page_title: string }).page_title)).toEqual(["B", "A", "B"]);
  });

  it("updates the global page_location (clean) before every manual page_view, so the tag's own events use it", async () => {
    const a = await load();
    const cmp = fakeCmp();
    a.initAnalytics();
    await flush();
    a.trackPageView(at("/"), "Home");
    cmp.emit({ gdprApplies: false, eventStatus: "tcloaded" });
    a.trackPageView(at("/tools/x?q=secret&email=a%40b.c&utm_campaign=c"), "X");
    const cmds = commands();
    const pv = cmds.findIndex((c) => c[0] === "event" && c[1] === "page_view");
    const clean = `${window.location.origin}/tools/x?utm_campaign=c`;
    expect(cmds[pv - 1]).toEqual(["set", { page_location: clean }]);
    expect(cmds[pv][2]).toEqual({ page_location: clean, page_title: "X" });
    expect(JSON.stringify(cmds)).not.toMatch(/secret|a%40b|a@b/);
  });

  it("never loads the Google tag twice across consent changes", async () => {
    const a = await load();
    const cmp = fakeCmp();
    a.initAnalytics();
    await flush();
    for (let i = 0; i < 3; i++) {
      cmp.emit(consent(true, true));
      cmp.emit(consent(false, false));
    }
    cmp.emit(consent(true, true));
    expect(gaScripts()).toBe(1);
    expect(commands().filter((c) => c[0] === "js")).toHaveLength(1);
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
    a.trackPageView(at("/"), "Home");
    await flush();
    expect(fetchFn).toHaveBeenCalledWith("/api/consent-region", expect.objectContaining({ cache: "no-store", credentials: "omit" }));
    expect(gaScripts()).toBe(1);
    expect(automaticPageLocation()).toBe(`${window.location.origin}/`);
    expect(events("page_view")).toHaveLength(0);
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

describe("analytics: trackEvent (calculator events)", () => {
  const tip = { calculator_name: "tip-calculator", calculator_category: "finance", calculator_type: "calculator" } as const;
  const sentEvents = () => commands().filter((c) => c[0] === "event" && c[1] !== "page_view");

  async function granted() {
    const a = await load();
    const cmp = fakeCmp();
    a.initAnalytics();
    await flush();
    a.trackPageView(at("/calculators/tip-calculator"), "Tip");
    cmp.emit(consent(true, true));
    return { a, cmp };
  }

  it("sends each of the four allowed events, with exactly the given parameters, once consent is granted", async () => {
    const { a } = await granted();
    a.trackEvent("calculator_calculate", { ...tip, trigger: "button" });
    a.trackEvent("calculator_calculate", { ...tip, trigger: "example" });
    a.trackEvent("calculator_result", { ...tip, result_status: "ok" });
    a.trackEvent("calculator_result", { ...tip, result_status: "invalid" });
    a.trackEvent("calculator_reset", { ...tip });
    a.trackEvent("calculator_copy_result", { ...tip, copy_status: "success" });
    a.trackEvent("calculator_copy_result", { ...tip, copy_status: "failed" });
    expect(sentEvents()).toEqual([
      ["event", "calculator_calculate", { ...tip, trigger: "button" }],
      ["event", "calculator_calculate", { ...tip, trigger: "example" }],
      ["event", "calculator_result", { ...tip, result_status: "ok" }],
      ["event", "calculator_result", { ...tip, result_status: "invalid" }],
      ["event", "calculator_reset", { ...tip }],
      ["event", "calculator_copy_result", { ...tip, copy_status: "success" }],
      ["event", "calculator_copy_result", { ...tip, copy_status: "failed" }],
    ]);
  });

  it("rejects anything outside the allow-lists or the catalog", async () => {
    const { a } = await granted();
    const bad: [string, Record<string, unknown>][] = [
      ["page_view", { ...tip }], // not a custom event name
      ["calculator_open", { ...tip }], // not allowed
      ["calculator_calculate", { ...tip }], // missing trigger
      ["calculator_calculate", { ...tip, trigger: "button", value: "123" }], // extra parameter
      ["calculator_calculate", { ...tip, trigger: "keystroke" }], // not in the enum
      ["calculator_result", { ...tip, result_status: "42.5" }], // not in the enum
      ["calculator_copy_result", { ...tip, copy_status: "ok" }], // not in the enum
      ["calculator_reset", { ...tip, calculator_name: "my secret text" }], // not in the catalog
      ["calculator_reset", { ...tip, calculator_category: "education" }], // category mismatch
      ["calculator_reset", { ...tip, calculator_type: "converter" }], // type mismatch
      ["calculator_reset", { ...tip, calculator_name: 123 }], // not a string
      ["calculator_reset", { calculator_name: "tip-calculator", calculator_category: "finance" }], // missing type
    ];
    for (const [name, params] of bad) {
      expect(a.validEvent(name, params), `${name} ${JSON.stringify(params)}`).toBe(false);
      (a.trackEvent as (n: string, p: Record<string, unknown>) => void)(name, params);
    }
    expect(sentEvents()).toEqual([]);
  });

  it("drops events before consent, and never queues them for later", async () => {
    const a = await load();
    const cmp = fakeCmp();
    a.initAnalytics();
    await flush();
    a.trackEvent("calculator_reset", { ...tip });
    cmp.emit(consent(true, true));
    expect(sentEvents()).toEqual([]);
  });

  it("drops events when consent is refused", async () => {
    const a = await load();
    const cmp = fakeCmp();
    a.initAnalytics();
    await flush();
    cmp.emit(consent(false, false));
    a.trackEvent("calculator_reset", { ...tip });
    expect(sentEvents()).toEqual([]);
  });

  it("drops events after withdrawal and resumes on re-consent", async () => {
    const { a, cmp } = await granted();
    a.trackEvent("calculator_reset", { ...tip });
    cmp.emit(consent(false, false));
    a.trackEvent("calculator_calculate", { ...tip, trigger: "button" });
    cmp.emit(consent(true, true));
    a.trackEvent("calculator_result", { ...tip, result_status: "ok" });
    expect(sentEvents().map((e) => e[1])).toEqual(["calculator_reset", "calculator_result"]);
  });

  it("drops events when the consent message never appears in the consent area", async () => {
    const a = await load();
    vi.useFakeTimers();
    a.initAnalytics();
    await flush();
    vi.advanceTimersByTime(11_000);
    a.trackEvent("calculator_reset", { ...tip });
    expect(sentEvents()).toEqual([]);
  });

  it("does nothing without a Measurement ID", async () => {
    const a = await load("");
    a.trackEvent("calculator_reset", { ...tip });
    expect(window.dataLayer).toEqual([]);
  });

  it("calculatorEventBase takes everything from the catalog and refuses mismatches", async () => {
    const a = await load();
    expect(a.calculatorEventBase("data-storage-converter", "technology")).toEqual({
      calculator_name: "data-storage-converter",
      calculator_category: "technology",
      calculator_type: "converter",
    });
    expect(a.calculatorEventBase("tip-calculator", "finance")).toEqual(tip);
    expect(a.calculatorEventBase("tip-calculator", "home")).toBeNull();
    expect(a.calculatorEventBase("not-a-calculator", "finance")).toBeNull();
  });
});
