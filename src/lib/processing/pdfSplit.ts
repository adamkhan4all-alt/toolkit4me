// ---------------------------------------------------------------------
// Client-side PDF splitting, using pdf-lib (MIT) entirely in the browser
// — the file never leaves the device. Mirrors the page-range parsing
// rules of the backend's src/lib/pageRange.ts (kept as parity logic, not
// a shared package, since the two projects don't share a boundary) so
// the same "1,3,5-7" syntax works the same way on both client and
// server-mode tools.
// ---------------------------------------------------------------------

// pdf-lib is dynamically imported inside splitPdf() below, not at module
// top level, so it lands in its own chunk (same pattern as jsPDF in
// pdfProcessing.ts) — pages that don't use Split PDF pay nothing for it.
import type { PDFDocument as PDFDocumentType } from "pdf-lib";

export class PdfSplitError extends Error {}

/** Parses "1,3,5-7" into a sorted, deduplicated list of 1-based page numbers. Throws PdfSplitError on malformed input. */
function parsePageRange(input: string): number[] {
  const segments = input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (segments.length === 0) {
    throw new PdfSplitError("Enter at least one page or page range.");
  }

  const pages = new Set<number>();
  for (const segment of segments) {
    const rangeMatch = segment.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      if (start < 1 || end < start) {
        throw new PdfSplitError(`Invalid page range: "${segment}".`);
      }
      for (let p = start; p <= end; p++) pages.add(p);
      continue;
    }
    if (/^\d+$/.test(segment)) {
      const n = Number(segment);
      if (n < 1) throw new PdfSplitError(`Invalid page number: "${segment}".`);
      pages.add(n);
      continue;
    }
    throw new PdfSplitError(`Invalid page selection: "${segment}".`);
  }
  return Array.from(pages).sort((a, b) => a - b);
}

/** Splits `ranges` (e.g. "1-3,5,7-9") into one output group per comma-separated segment. */
function parseGroups(rangesInput: string, pageCount: number): number[][] {
  const groupStrings = rangesInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (groupStrings.length === 0) {
    throw new PdfSplitError("Enter at least one page or page range.");
  }

  return groupStrings.map((group) => {
    const pages = parsePageRange(group);
    const outOfRange = pages.find((p) => p > pageCount);
    if (outOfRange) {
      throw new PdfSplitError(`Page ${outOfRange} doesn't exist — this PDF only has ${pageCount} page(s).`);
    }
    return pages;
  });
}

export interface SplitPdfOptions {
  mode: "ranges" | "every";
  ranges: string;
  everyN: string;
}

export interface SplitPdfOutput {
  fileName: string;
  blob: Blob;
  pageCount: number;
}

/** Splits a single PDF File into one or more output PDFs per `options`. Never touches a server. */
export async function splitPdf(file: File, options: SplitPdfOptions): Promise<SplitPdfOutput[]> {
  const { PDFDocument } = await import("pdf-lib");
  const inputBytes = await file.arrayBuffer();
  let source: PDFDocumentType;
  try {
    source = await PDFDocument.load(inputBytes, { ignoreEncryption: false });
  } catch {
    throw new PdfSplitError(`"${file.name}" couldn't be read as a PDF. It may be corrupted or password-protected.`);
  }

  const pageCount = source.getPageCount();
  if (pageCount === 0) {
    throw new PdfSplitError("This PDF has no pages.");
  }

  let groups: number[][];
  if (options.mode === "every") {
    const n = Number(options.everyN);
    if (!Number.isInteger(n) || n < 1) {
      throw new PdfSplitError("Enter a whole number of 1 or more for pages per file.");
    }
    groups = [];
    for (let start = 1; start <= pageCount; start += n) {
      const group: number[] = [];
      for (let p = start; p < start + n && p <= pageCount; p++) group.push(p);
      groups.push(group);
    }
  } else {
    const trimmed = options.ranges.trim();
    groups = trimmed ? parseGroups(trimmed, pageCount) : [Array.from({ length: pageCount }, (_, i) => i + 1)];
  }

  const baseName = file.name.replace(/\.pdf$/i, "");
  const outputs: SplitPdfOutput[] = [];

  for (let i = 0; i < groups.length; i++) {
    const pageNumbers = groups[i];
    const out = await PDFDocument.create();
    const copied = await out.copyPages(
      source,
      pageNumbers.map((p) => p - 1)
    );
    copied.forEach((page) => out.addPage(page));
    const bytes = await out.save({ useObjectStreams: true });
    const label = groups.length > 1 ? `-part${i + 1}` : "";
    outputs.push({
      fileName: `${baseName}${label}.pdf`,
      blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
      pageCount: pageNumbers.length,
    });
  }

  return outputs;
}
