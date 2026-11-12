import { describe, expect, it } from "vitest";
import { aliasProblem, countryName, destinationProblem, expiryProblem, isoToLocalInput, localInputToIso } from "../format";

describe("Link Studio form checks (mirror the Worker's rules)", () => {
  it("accepts valid aliases and leaves an empty one to the generator", () => {
    for (const a of ["", "summer26", "my-store", "a_b", "abc", "A".repeat(64)]) expect(aliasProblem(a)).toBeNull();
  });

  it("rejects short, long, malformed and reserved aliases", () => {
    expect(aliasProblem("ab")).toMatch(/at least 3/);
    expect(aliasProblem("a".repeat(65))).toMatch(/at most 64/);
    for (const a of ["-abc", "abc-", "a b c", "abc/def", "über"]) expect(aliasProblem(a)).toMatch(/letters, numbers/);
    for (const a of ["admin", "API", "Link-Studio"]) expect(aliasProblem(a)).toMatch(/reserved/);
  });

  it("checks destinations", () => {
    expect(destinationProblem("https://example.com/x")).toBeNull();
    expect(destinationProblem("")).toMatch(/Enter/);
    expect(destinationProblem("example.com")).toMatch(/https/);
    expect(destinationProblem("javascript:alert(1)")).toMatch(/Only http/);
    expect(destinationProblem("https://u:p@example.com")).toMatch(/user name/);
    expect(destinationProblem("https://intranet")).toMatch(/full domain/);
    expect(destinationProblem("https://go.toolkit4me.com/abc")).toMatch(/can't point/);
    expect(destinationProblem(`https://e.com/${"a".repeat(2050)}`)).toMatch(/2,048/);
  });

  it("checks expiry: future and within 10 years", () => {
    const now = new Date("2026-11-12T12:00:00").getTime();
    expect(expiryProblem("", now)).toBeNull();
    expect(expiryProblem("2027-01-01T00:00", now)).toBeNull();
    expect(expiryProblem("2026-11-12T11:00", now)).toMatch(/future/);
    expect(expiryProblem("2037-01-01T00:00", now)).toMatch(/10 years/);
  });

  it("round-trips datetime-local values through ISO", () => {
    const iso = localInputToIso("2027-03-04T05:06");
    expect(iso).toMatch(/Z$/);
    expect(isoToLocalInput(iso)).toBe("2027-03-04T05:06");
    expect(localInputToIso("")).toBeNull();
    expect(isoToLocalInput(null)).toBe("");
  });

  it("names countries and passes special values through", () => {
    expect(countryName("GB")).toMatch(/United Kingdom|GB/);
    expect(countryName("(unknown)")).toBe("(unknown)");
    expect(countryName("XX")).toBe("(unknown)");
    expect(countryName("T1")).toBe("Tor network");
  });
});
