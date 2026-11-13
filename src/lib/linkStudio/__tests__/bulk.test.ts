import { describe, expect, it } from "vitest";
import { bulkResultsCsv, csvCell, parseBulkInput } from "../bulk";
import type { ShortLink } from "../client";

const link = (code: string, url: string): ShortLink => ({
  code,
  shortUrl: `https://go.toolkit4me.com/${code}`,
  url,
  clicks: 0,
  status: "active",
  isActive: true,
  redirectType: 302,
  createdAt: null,
  updatedAt: null,
  expiresAt: null,
  lastClickedAt: null,
  oneTime: false,
  redeemedAt: null,
  source: "admin",
});

describe("parseBulkInput", () => {
  it("reads one URL per line with an optional alias, skipping blank lines", () => {
    const { rows, tooMany } = parseBulkInput("https://a.example/x\n\n  https://b.example/y  promo-1\r\nhttps://c.example/z,menu_2");
    expect(tooMany).toBe(false);
    expect(rows).toEqual([
      { line: 1, url: "https://a.example/x" },
      { line: 3, url: "https://b.example/y", alias: "promo-1" },
      { line: 4, url: "https://c.example/z", alias: "menu_2" },
    ]);
  });

  it("flags invalid URLs, invalid or reserved aliases and extra columns per line", () => {
    const { rows } = parseBulkInput("not-a-url\nftp://a.example\nhttps://a.example x\nhttps://a.example bulk\nhttps://a.example ok-alias extra\nhttps://go.toolkit4me.com/abc");
    expect(rows.map((r) => Boolean(r.problem))).toEqual([true, true, true, true, true, true]);
  });

  it("reports more than 50 lines as too many", () => {
    const text = Array.from({ length: 51 }, (_, i) => `https://a.example/${i}`).join("\n");
    expect(parseBulkInput(text).tooMany).toBe(true);
    expect(parseBulkInput(text.split("\n").slice(0, 50).join("\n")).tooMany).toBe(false);
  });
});

describe("CSV export", () => {
  it("quotes cells that need it and neutralises spreadsheet formulas", () => {
    expect(csvCell("plain")).toBe("plain");
    expect(csvCell('a,"b"')).toBe('"a,""b"""');
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell("+1")).toBe("'+1");
    expect(csvCell("@cmd")).toBe("'@cmd");
  });

  it("lists every row with its short link or its error", () => {
    const csv = bulkResultsCsv([
      { row: { line: 1, url: "https://a.example/x" }, result: { index: 0, ok: true, link: link("abc1234", "https://a.example/x") } },
      { row: { line: 2, url: "nope", problem: "Enter a full URL starting with https://" } },
      { row: { line: 3, url: "https://b.example", alias: "taken" }, result: { index: 1, ok: false, error: { code: "alias_taken", message: "This alias is already in use" } } },
    ]);
    expect(csv.startsWith("﻿line,original_url,short_url,code,status,error\r\n")).toBe(true);
    const lines = csv.trim().split("\r\n");
    expect(lines[1]).toBe("1,https://a.example/x,https://go.toolkit4me.com/abc1234,abc1234,created,");
    expect(lines[2]).toBe("2,nope,,,failed,Enter a full URL starting with https://");
    expect(lines[3]).toBe("3,https://b.example,,,failed,This alias is already in use");
  });
});
