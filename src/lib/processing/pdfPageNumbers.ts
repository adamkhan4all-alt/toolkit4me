// ---------------------------------------------------------------------
// PDF Page Numbers — stamps page numbers onto an existing PDF with
// pdf-lib (MIT, already used by Split PDF / the PDF Editor), entirely in
// the browser. Handles rotated pages (/Rotate 90/180/270) and cropped
// pages (CropBox ≠ MediaBox), so numbers land upright and on the visible
// page, where a naive implementation would put them sideways or off-page.
// ---------------------------------------------------------------------

import { degrees, PDFDocument, StandardFonts, rgb, type PDFPage } from "pdf-lib";
import { UserFacingError } from "./errors";

export type NumberPosition = "bottom-center" | "bottom-right" | "bottom-left" | "top-center" | "top-right" | "top-left";
export type NumberFormat = "n" | "page-n" | "page-n-of-t" | "n-of-t";

export interface PageNumberOptions {
  position: NumberPosition;
  format: NumberFormat;
  startAt: number;
  fontSize: number;
  /** Leave the first page (e.g. a cover) unnumbered; numbering then starts on page 2. */
  skipFirst: boolean;
}

/** Distance from the page edge to the text, in points (1/72 inch ≈ 0.35mm) — about 10mm. */
const MARGIN = 28;

export function labelFor(format: NumberFormat, n: number, total: number): string {
  switch (format) {
    case "page-n":
      return `Page ${n}`;
    case "page-n-of-t":
      return `Page ${n} of ${total}`;
    case "n-of-t":
      return `${n} / ${total}`;
    default:
      return String(n);
  }
}

/**
 * Maps a point in the page's *visual* frame (what the reader sees, origin
 * bottom-left of the visible crop box) to PDF user space, and returns the
 * text rotation needed so the label reads upright after the viewer applies
 * the page's /Rotate (which turns the page clockwise for display).
 */
export function toUserSpace(
  rotation: number,
  box: { x: number; y: number; width: number; height: number },
  vx: number,
  vy: number
): { x: number; y: number; rotate: number } {
  const r = ((rotation % 360) + 360) % 360;
  const { x, y, width: w, height: h } = box;
  if (r === 90) return { x: x + w - vy, y: y + vx, rotate: 90 };
  if (r === 180) return { x: x + w - vx, y: y + h - vy, rotate: 180 };
  if (r === 270) return { x: x + vy, y: y + h - vx, rotate: 270 };
  return { x: x + vx, y: y + vy, rotate: 0 };
}

function visualPosition(position: NumberPosition, visualWidth: number, visualHeight: number, textWidth: number, fontSize: number) {
  const vx = position.endsWith("left") ? MARGIN : position.endsWith("right") ? visualWidth - MARGIN - textWidth : (visualWidth - textWidth) / 2;
  const vy = position.startsWith("top") ? visualHeight - MARGIN - fontSize : MARGIN;
  return { vx, vy };
}

export async function addPageNumbers(bytes: ArrayBuffer, options: PageNumberOptions): Promise<{ pdf: Uint8Array; numbered: number; total: number }> {
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(bytes);
  } catch (err) {
    if (err instanceof Error && /encrypt/i.test(err.message)) {
      throw new UserFacingError("This PDF is password-protected. Remove the password with Unlock PDF first, then add page numbers.");
    }
    throw new UserFacingError("This file couldn't be read as a PDF. It may be damaged — try opening and re-saving it first.");
  }

  const pages: PDFPage[] = doc.getPages();
  if (pages.length === 0) throw new UserFacingError("This PDF has no pages.");
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const first = options.skipFirst ? 1 : 0;
  // "of N" counts the pages that actually get a number.
  const total = options.startAt + (pages.length - first) - 1;

  for (let i = first; i < pages.length; i++) {
    const page = pages[i];
    const label = labelFor(options.format, options.startAt + (i - first), total);
    const textWidth = font.widthOfTextAtSize(label, options.fontSize);
    const box = page.getCropBox();
    const rotation = page.getRotation().angle;
    const sideways = ((rotation % 360) + 360) % 180 === 90;
    const [visualWidth, visualHeight] = sideways ? [box.height, box.width] : [box.width, box.height];
    const { vx, vy } = visualPosition(options.position, visualWidth, visualHeight, textWidth, options.fontSize);
    const { x, y, rotate } = toUserSpace(rotation, box, vx, vy);
    page.drawText(label, { x, y, size: options.fontSize, font, color: rgb(0.2, 0.2, 0.2), rotate: degrees(rotate) });
  }

  return { pdf: await doc.save(), numbered: pages.length - first, total: pages.length };
}
