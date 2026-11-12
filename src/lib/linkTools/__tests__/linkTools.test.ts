import { describe, expect, it } from "vitest";
import { validateUrl } from "../urlValidator";
import { cleanUrl, DEFAULT_CLEAN_OPTIONS, isTrackingParam, parseUrl, splitQuery } from "../urlCleaner";
import { decodeUrlText, encodeUrlText, UrlCodecError } from "../urlCodec";
import { buildUtmUrl, type UtmFields } from "../utm";

const severities = (raw: string) => validateUrl(raw).checks.map((c) => c.severity);

describe("validateUrl", () => {
  it("accepts a normal https address with no warnings", () => {
    const r = validateUrl("https://www.example.com/page?a=1");
    expect(r.valid).toBe(true);
    expect(severities("https://www.example.com/page?a=1")).toEqual(["info"]);
    expect(r.parts?.host).toBe("www.example.com");
  });

  it("rejects empty input", () => {
    expect(validateUrl("   ").valid).toBe(false);
  });

  it("suggests https:// for a bare domain", () => {
    const r = validateUrl("example.com/shop");
    expect(r.valid).toBe(false);
    expect(r.suggestion).toBe("https://example.com/shop");
    expect(validateUrl("www.example.com").suggestion).toBe("https://www.example.com");
    expect(validateUrl("example.com:8080/x").suggestion).toBe("https://example.com:8080/x");
  });

  it("suggests a fix for protocol-relative and single-slash addresses", () => {
    expect(validateUrl("//example.com").suggestion).toBe("https://example.com");
    expect(validateUrl("https:/example.com").suggestion).toBe("https://example.com");
  });

  it("rejects spaces and suggests %20", () => {
    const r = validateUrl("https://example.com/my page");
    expect(r.valid).toBe(false);
    expect(r.suggestion).toBe("https://example.com/my%20page");
  });

  it("rejects non-web schemes", () => {
    expect(validateUrl("mailto:someone@example.com").valid).toBe(false);
    expect(validateUrl("javascript:alert(1)").valid).toBe(false);
    expect(validateUrl("ftp://files.example.com").valid).toBe(false);
  });

  it("rejects incomplete and malformed domains", () => {
    expect(validateUrl("https://intranet/page").valid).toBe(false);
    expect(validateUrl("https://-bad.example.com").valid).toBe(false);
    expect(validateUrl("https://example.123").valid).toBe(false);
    expect(validateUrl(`https://${"a".repeat(64)}.com`).valid).toBe(false);
    expect(validateUrl("https://999.1.1.1").valid).toBe(false);
  });

  it("warns about http, credentials, IP hosts and localhost but still treats them as valid", () => {
    for (const u of ["http://example.com", "https://user:pw@example.com", "https://192.168.1.1/admin", "http://localhost:3000"]) {
      const r = validateUrl(u);
      expect(r.valid).toBe(true);
      expect(r.checks.some((c) => c.severity === "warning")).toBe(true);
    }
  });

  it("flags international domains, tracking parameters, fragments and long addresses", () => {
    expect(validateUrl("https://bücher.de").checks.some((c) => c.message.includes("xn--"))).toBe(true);
    expect(validateUrl("https://example.com/?utm_source=x&fbclid=1").checks.some((c) => c.message.includes("utm_source, fbclid"))).toBe(true);
    expect(validateUrl("https://example.com/#top").checks.some((c) => c.message.includes("fragment"))).toBe(true);
    expect(validateUrl(`https://example.com/${"a".repeat(2100)}`).checks.some((c) => c.severity === "warning")).toBe(true);
  });
});

describe("parseUrl / splitQuery", () => {
  it("splits an address into parts and decodes parameters", () => {
    const r = parseUrl("https://user@shop.example.com:8443/a/b%20c?q=red+shoes&x=%C3%A9&flag#reviews");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.url.host).toBe("shop.example.com");
    expect(r.url.port).toBe("8443");
    expect(r.url.username).toBe("user");
    expect(r.url.pathSegments).toEqual(["a", "b c"]);
    expect(r.url.params.map((p) => [p.name, p.value])).toEqual([
      ["q", "red shoes"],
      ["x", "é"],
      ["flag", ""],
    ]);
    expect(r.url.fragment).toBe("#reviews");
  });

  it("adds https:// to a bare domain and rejects junk", () => {
    const r = parseUrl("example.com/x");
    expect(r.ok && r.url.href).toBe("https://example.com/x");
    expect(parseUrl("not a url").ok).toBe(false);
    expect(parseUrl("ftp://example.com").ok).toBe(false);
  });

  it("keeps malformed percent sequences readable instead of throwing", () => {
    expect(splitQuery("a=%E0%A4%A&b=1")[0].value).toBe("%E0%A4%A");
  });

  it("recognises tracking parameters case-insensitively", () => {
    expect(isTrackingParam("UTM_Source")).toBe(true);
    expect(isTrackingParam("fbclid")).toBe(true);
    expect(isTrackingParam("id")).toBe(false);
    expect(isTrackingParam("page")).toBe(false);
  });
});

describe("cleanUrl", () => {
  it("removes tracking parameters and keeps the rest byte-for-byte", () => {
    const r = cleanUrl("https://example.com/p?id=7&utm_source=news&q=a%20b+c&fbclid=XYZ#top");
    expect(r).toMatchObject({ ok: true, url: "https://example.com/p?id=7&q=a%20b+c#top", removed: ["utm_source", "fbclid"], changed: true });
  });

  it("reports no change for an already clean address", () => {
    const r = cleanUrl("https://example.com/p?id=7");
    expect(r.ok && r.changed).toBe(false);
  });

  it("applies the optional clean-ups", () => {
    const r = cleanUrl("https://www.example.com/a/b/?z=1&a=&m=2#frag", {
      ...DEFAULT_CLEAN_OPTIONS,
      removeEmptyParams: true,
      removeFragment: true,
      sortParams: true,
      removeTrailingSlash: true,
      removeWww: true,
    });
    expect(r.ok && r.url).toBe("https://example.com/a/b?m=2&z=1");
  });

  it("removes every parameter when asked, but never the slash of a bare domain", () => {
    const r = cleanUrl("https://example.com/?a=1&b=2", { ...DEFAULT_CLEAN_OPTIONS, removeAllParams: true, removeTrailingSlash: true });
    expect(r.ok && r.url).toBe("https://example.com/");
  });

  it("does not strip www from a two-label host", () => {
    const r = cleanUrl("https://www.com/", { ...DEFAULT_CLEAN_OPTIONS, removeWww: true });
    expect(r.ok && r.url).toBe("https://www.com/");
  });
});

describe("URL encoding", () => {
  it("encodes a component, a full URL and form data", () => {
    expect(encodeUrlText("a b&c=d/é", "component")).toBe("a%20b%26c%3Dd%2F%C3%A9");
    expect(encodeUrlText("https://example.com/a b?x=1&y=é", "fullUrl")).toBe("https://example.com/a%20b?x=1&y=%C3%A9");
    expect(encodeUrlText("red shoes & bags", "form")).toBe("red+shoes+%26+bags");
  });

  it("round-trips Unicode and emoji", () => {
    const text = "naïve café 😀 / ?&=#";
    expect(decodeUrlText(encodeUrlText(text, "component"), false).text).toBe(text);
  });

  it("throws a readable error for lone surrogates", () => {
    expect(() => encodeUrlText("\uD800", "component")).toThrow(UrlCodecError);
  });

  it("decodes plus as space only when asked", () => {
    expect(decodeUrlText("a+b%20c", true).text).toBe("a b c");
    expect(decodeUrlText("a+b%20c", false).text).toBe("a+b c");
  });

  it("points at a malformed escape", () => {
    expect(() => decodeUrlText("100% sure", false)).toThrow(/character 4/);
    expect(() => decodeUrlText("ok %C3%28 bad", false)).toThrow(/character 4/);
  });

  it("detects double encoding", () => {
    expect(decodeUrlText("a%2520b", false)).toEqual({ text: "a%20b", looksDoubleEncoded: true });
    expect(decodeUrlText("a%20b", false).looksDoubleEncoded).toBe(false);
  });
});

describe("buildUtmUrl", () => {
  const fields = (f: Partial<UtmFields>): UtmFields => ({ source: "", medium: "", campaign: "", term: "", content: "", id: "", ...f });
  const opts = { lowercase: true, spaces: "keep" as const };

  it("adds UTM parameters in a consistent order", () => {
    const r = buildUtmUrl("https://example.com/sale", fields({ source: "Newsletter", medium: "email", campaign: "Spring Sale" }), opts);
    expect(r).toEqual({ ok: true, url: "https://example.com/sale?utm_source=newsletter&utm_medium=email&utm_campaign=spring%20sale", warnings: [] });
  });

  it("keeps existing parameters and the fragment, and replaces old UTM values", () => {
    const r = buildUtmUrl("https://example.com/p?id=4&q=a+b&UTM_SOURCE=old#buy", fields({ source: "x", medium: "social", campaign: "c" }), opts);
    expect(r.ok && r.url).toBe("https://example.com/p?id=4&q=a+b&utm_source=x&utm_medium=social&utm_campaign=c#buy");
  });

  it("replaces spaces when asked and adds https://", () => {
    const r = buildUtmUrl("example.com", fields({ source: "big promo", medium: "cpc", campaign: "black friday" }), { lowercase: true, spaces: "dash" });
    expect(r.ok && r.url).toBe("https://example.com/?utm_source=big-promo&utm_medium=cpc&utm_campaign=black-friday");
    expect(r.ok && r.warnings[0]).toMatch(/https:\/\/ was added/);
  });

  it("requires a source and a valid landing page", () => {
    expect(buildUtmUrl("https://example.com", fields({ medium: "email" }), opts).ok).toBe(false);
    expect(buildUtmUrl("", fields({ source: "x" }), opts).ok).toBe(false);
    expect(buildUtmUrl("ftp://example.com", fields({ source: "x" }), opts).ok).toBe(false);
    expect(buildUtmUrl("https://localhost", fields({ source: "x" }), opts).ok).toBe(false);
  });

  it("warns about missing medium/campaign, unknown mediums and mixed case", () => {
    const missing = buildUtmUrl("https://example.com", fields({ source: "x" }), opts);
    expect(missing.ok && missing.warnings.length).toBe(2);
    const odd = buildUtmUrl("https://example.com", fields({ source: "x", medium: "carrier-pigeon", campaign: "c" }), opts);
    expect(odd.ok && odd.warnings.some((w) => w.includes("Unassigned"))).toBe(true);
    const mixed = buildUtmUrl("https://example.com", fields({ source: "Facebook", medium: "social", campaign: "c" }), { lowercase: false, spaces: "keep" });
    expect(mixed.ok && mixed.warnings.some((w) => w.includes("case-sensitive"))).toBe(true);
  });
});
