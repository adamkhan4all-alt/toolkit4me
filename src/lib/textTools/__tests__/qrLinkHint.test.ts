import { describe, expect, it } from "vitest";
import { linkHint } from "../qr";

describe("linkHint", () => {
  it("accepts complete links and plain text", () => {
    expect(linkHint("https://www.example.com/menu?table=4")).toBeNull();
    expect(linkHint("http://example.com")).toBeNull();
    expect(linkHint("Table 4 — ask staff for the Wi-Fi password")).toBeNull();
    expect(linkHint("WIFI:T:WPA;S:Cafe;P:secret;;")).toBeNull();
    expect(linkHint("hello@example.com")).toBeNull();
    expect(linkHint("version 1.2.3")).toBeNull();
    expect(linkHint("")).toBeNull();
  });

  it("offers to add https:// to bare web addresses", () => {
    expect(linkHint("www.example.com")?.fix).toBe("https://www.example.com");
    expect(linkHint("example.co.uk/menu")?.fix).toBe("https://example.co.uk/menu");
    expect(linkHint("  shop.example.com  ")?.fix).toBe("https://shop.example.com");
  });

  it("offers to trim whitespace around a link", () => {
    expect(linkHint("https://example.com\n")?.fix).toBe("https://example.com");
  });

  it("warns about spaces inside a link without offering a fix", () => {
    const hint = linkHint("https://example.com/my menu.pdf");
    expect(hint?.message).toMatch(/space/);
    expect(hint?.fix).toBeUndefined();
  });
});
