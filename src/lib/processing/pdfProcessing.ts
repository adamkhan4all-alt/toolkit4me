// ---------------------------------------------------------------------
// Client-side JPG -> PDF assembly.
//
// jsPDF is dynamically imported inside buildPdfFromImages() rather than
// imported at the top of this module, so it lands in its own chunk and
// is only ever fetched when someone actually uses the JPG to PDF tool —
// every other page pays nothing for it.
// ---------------------------------------------------------------------

import { ImageProcessingError, loadImage } from "./imageProcessing";

export type PdfPageSize = "a4" | "letter" | "fit";

const PAGE_SIZES_PT: Record<Exclude<PdfPageSize, "fit">, { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
};

export interface BuildPdfOptions {
  pageSize: PdfPageSize;
}

export interface BuildPdfResult {
  blob: Blob;
  pageCount: number;
}

/** Combines one or more JPG images into a single PDF, one image per page. */
export async function buildPdfFromImages(files: File[], options: BuildPdfOptions): Promise<BuildPdfResult> {
  if (files.length === 0) {
    throw new ImageProcessingError("Add at least one image before converting to PDF.");
  }

  const { jsPDF } = await import("jspdf");

  let doc: InstanceType<typeof jsPDF> | null = null;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const img = await loadImage(file);
    const dataUrl = await fileToDataUrl(file);

    const imgRatio = img.naturalWidth / img.naturalHeight;

    let pageWidth: number;
    let pageHeight: number;
    if (options.pageSize === "fit") {
      // Use the image's own pixel dimensions (at 72dpi) as the page size.
      pageWidth = img.naturalWidth;
      pageHeight = img.naturalHeight;
    } else {
      ({ width: pageWidth, height: pageHeight } = PAGE_SIZES_PT[options.pageSize]);
    }

    if (i === 0) {
      doc = new jsPDF({
        orientation: pageWidth > pageHeight ? "landscape" : "portrait",
        unit: "pt",
        format: [pageWidth, pageHeight],
      });
    } else if (doc) {
      doc.addPage([pageWidth, pageHeight], pageWidth > pageHeight ? "landscape" : "portrait");
    }

    // Fit the image inside the page while preserving aspect ratio, centered.
    const pageRatio = pageWidth / pageHeight;
    let drawWidth: number;
    let drawHeight: number;
    if (imgRatio > pageRatio) {
      drawWidth = pageWidth;
      drawHeight = pageWidth / imgRatio;
    } else {
      drawHeight = pageHeight;
      drawWidth = pageHeight * imgRatio;
    }
    const x = (pageWidth - drawWidth) / 2;
    const y = (pageHeight - drawHeight) / 2;

    doc!.addImage(dataUrl, "JPEG", x, y, drawWidth, drawHeight, undefined, "FAST");
  }

  if (!doc) {
    throw new ImageProcessingError("Couldn't build the PDF from the provided images.");
  }

  const blob = doc.output("blob");
  return { blob, pageCount: files.length };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new ImageProcessingError(`"${file.name}" couldn't be read.`));
    reader.readAsDataURL(file);
  });
}
