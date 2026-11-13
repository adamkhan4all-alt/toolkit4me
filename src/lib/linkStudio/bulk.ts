// Bulk shortener helpers: parse the pasted list, and export results as CSV.
import { BULK_MAX_ITEMS, type BulkItemResult } from "./client";
import { aliasProblem, destinationProblem } from "./format";

export interface BulkRow {
  /** 1-based line number in the pasted text. */
  line: number;
  url: string;
  alias?: string;
  /** Problem found in the browser; such rows are not sent. */
  problem?: string;
}

/**
 * One link per line: `URL` or `URL alias` (separated by a space, tab or comma). Blank lines are ignored.
 * Checks each line the same way the single-link form does, so obvious mistakes are flagged before sending.
 */
export function parseBulkInput(text: string): { rows: BulkRow[]; tooMany: boolean } {
  const rows: BulkRow[] = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (line === "") return;
    const [url = "", alias, ...extra] = line.split(/[\s,]+/);
    const row: BulkRow = { line: i + 1, url, ...(alias ? { alias } : {}) };
    row.problem = extra.length > 0 ? "Put one URL (and optionally one alias) per line." : (destinationProblem(url) ?? (alias ? (aliasProblem(alias) ?? undefined) : undefined));
    if (!row.problem) delete row.problem;
    rows.push(row);
  });
  return { rows, tooMany: rows.length > BULK_MAX_ITEMS };
}

/** A CSV cell: quoted when needed, and neutralised if it would start a spreadsheet formula (CSV injection). */
export function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export interface BulkOutcome {
  row: BulkRow;
  result?: BulkItemResult;
}

export function bulkResultsCsv(outcomes: BulkOutcome[]): string {
  const header = ["line", "original_url", "short_url", "code", "status", "error"];
  const lines = outcomes.map(({ row, result }) => {
    const ok = result?.ok ? result.link : null;
    const error = row.problem ?? (result && !result.ok ? result.error.message : "");
    return [String(row.line), ok?.url ?? row.url, ok?.shortUrl ?? "", ok?.code ?? "", ok ? "created" : "failed", error].map(csvCell).join(",");
  });
  // CRLF and a BOM so Excel opens it as UTF-8 with correct rows.
  return `﻿${[header.join(","), ...lines].join("\r\n")}\r\n`;
}
