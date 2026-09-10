// ---------------------------------------------------------------------
// Applies the PDF Editor's accumulated edits (page order, rotation,
// deletion, added text) to the original file and produces the final PDF
// — via pdf-lib (MIT), entirely client-side. See src/lib/processing/
// pdfThumbnails.ts for the PDF.js-based page previews this operates on.
// ---------------------------------------------------------------------

// pdf-lib is dynamically imported inside applyPdfEdits() below, not at
// module top level, so it lands in its own chunk (same pattern as jsPDF
// in pdfProcessing.ts) — pages that don't use the PDF Editor pay nothing for it.

export class PdfEditError extends Error {}

export interface PdfEditorPage {
  /** 0-based index into the ORIGINAL document — stable even as pages are reordered/deleted. */
  originalIndex: number;
  /** Additional rotation applied on top of the page's existing rotation, in 90° steps. */
  rotation: 0 | 90 | 180 | 270;
  deleted: boolean;
}

export interface PdfTextAnnotation {
  originalIndex: number;
  /** Position as a fraction (0–1) of the page's width/height, from the top-left — resolution-independent of thumbnail size. */
  xPct: number;
  yPct: number;
  text: string;
}

/** Builds the final edited PDF: copies pages in the current order (skipping deleted ones), applies rotation, then draws any text annotations. */
export async function applyPdfEdits(
  originalBytes: ArrayBuffer,
  order: PdfEditorPage[],
  annotations: PdfTextAnnotation[]
): Promise<Blob> {
  const { PDFDocument, StandardFonts, rgb, degrees } = await import("pdf-lib");
  let source: Awaited<ReturnType<typeof PDFDocument.load>>;
  try {
    source = await PDFDocument.load(originalBytes, { ignoreEncryption: false });
  } catch {
    throw new PdfEditError("This PDF couldn't be read. It may be corrupted or password-protected.");
  }

  const kept = order.filter((p) => !p.deleted);
  if (kept.length === 0) {
    throw new PdfEditError("At least one page must remain — you've deleted every page.");
  }

  const out = await PDFDocument.create();
  const font = await out.embedFont(StandardFonts.Helvetica);

  const copiedPages = await out.copyPages(
    source,
    kept.map((p) => p.originalIndex)
  );

  copiedPages.forEach((page, i) => {
    const entry = kept[i];
    if (entry.rotation !== 0) {
      page.setRotation(degrees(page.getRotation().angle + entry.rotation));
    }
    out.addPage(page);

    const { width, height } = page.getSize();
    for (const ann of annotations) {
      if (ann.originalIndex !== entry.originalIndex || !ann.text.trim()) continue;
      page.drawText(ann.text, {
        x: ann.xPct * width,
        y: height - ann.yPct * height,
        size: 14,
        font,
        color: rgb(0.9, 0.1, 0.1),
      });
    }
  });

  const bytes = await out.save({ useObjectStreams: true });
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}
