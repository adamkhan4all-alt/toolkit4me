import { describe, expect, it } from "vitest";
import { consentRequiredFor } from "../region";
import { GET } from "../../consent-region";

describe("consent region", () => {
  it("requires consent in the EEA, UK and Switzerland", () => {
    for (const c of ["DE", "FR", "IE", "NO", "IS", "LI", "GB", "CH", "de"]) expect(consentRequiredFor(c), c).toBe(true);
  });
  it("doesn't elsewhere", () => {
    for (const c of ["US", "PK", "IN", "AE", "CA", "AU"]) expect(consentRequiredFor(c), c).toBe(false);
  });
  it("fails closed when the country is unknown or malformed", () => {
    for (const c of [null, undefined, "", "XX1", "EU-ish", "T1"]) expect(consentRequiredFor(c as string), String(c)).toBe(true);
  });
  it("the endpoint returns only the decision, uncached", async () => {
    const res = GET(new Request("https://www.toolkit4me.com/api/consent-region", { headers: { "x-vercel-ip-country": "US" } }));
    expect(res.headers.get("Cache-Control")).toMatch(/no-store/);
    const body = await res.json();
    expect(JSON.stringify(body)).not.toContain("US");
    expect(body).toMatchObject({ consentRequired: false });
    const eu = await GET(new Request("https://x/api/consent-region", { headers: { "x-vercel-ip-country": "FR" } })).json();
    expect(eu).toMatchObject({ consentRequired: true });
    const unknown = await GET(new Request("https://x/api/consent-region")).json();
    expect(unknown).toMatchObject({ consentRequired: true });
  });
});
