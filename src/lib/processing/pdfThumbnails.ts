// ---------------------------------------------------------------------
// PDF page rendering for the PDF Editor's page grid — Mozilla's PDF.js
// (Apache-2.0), used exactly per the brief: page rendering / thumbnails /
// navigation, never a custom-built renderer. Runs entirely client-side;
// the file is never uploaded.
// ---------------------------------------------------------------------

// pdfjs-dist (and its worker script) is dynamically imported inside the
// functions below, not at module top level, so it lands in its own chunk
// (same pattern as jsPDF in pdfProcessing.ts) — pages that don't open the
// PDF Editor pay nothing for it.
import type { PDFDocumentProxy } from "pdfjs-dist";

export class PdfLoadError extends Error {}

let workerConfigured = false;

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  if (!workerConfigured) {
    // Vite ?url import — resolves to a hashed asset URL for the worker
    // script pdf.js needs to run its parsing/rendering off the main thread.
    const { default: pdfWorkerUrl } = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    workerConfigured = true;
  }
  return pdfjs;
}

/** Loads a PDF File into a pdf.js document proxy. Throws PdfLoadError for anything unreadable. */
export async function loadPdfDocument(file: File): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfjs();
  const bytes = await file.arrayBuffer();
  try {
    return await pdfjs.getDocument({ data: bytes }).promise;
  } catch {
    throw new PdfLoadError(`"${file.name}" couldn't be opened. It may be corrupted or password-protected.`);
  }
}

/** Renders one page to a PNG data URL at roughly `targetWidth` CSS pixels wide, for use as a thumbnail. */
export async function renderPageThumbnail(doc: PDFDocumentProxy, pageNumber: number, targetWidth: number): Promise<string> {
  const page = await doc.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1, rotation: 0 });
  const scale = targetWidth / baseViewport.width;
  const viewport = page.getViewport({ scale, rotation: 0 });

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d");
  if (!context) throw new PdfLoadError("Your browser doesn't support canvas rendering, needed to preview PDF pages.");

  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL("image/png");
}
