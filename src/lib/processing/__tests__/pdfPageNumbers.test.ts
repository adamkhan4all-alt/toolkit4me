// @vitest-environment node
import { describe, expect, it } from "vitest";
import { degrees, PDFDocument } from "pdf-lib";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { addPageNumbers, labelFor, toUserSpace, type PageNumberOptions } from "../pdfPageNumbers";

const base: PageNumberOptions = { position: "bottom-center", format: "n", startAt: 1, fontSize: 11, skipFirst: false };

async function makePdf(pages: { size?: [number, number]; rotate?: number; crop?: [number, number, number, number] }[]) {
  const doc = await PDFDocument.create();
  for (const p of pages) {
    const page = doc.addPage(p.size ?? [595, 842]);
    if (p.rotate) page.setRotation(degrees(p.rotate));
    if (p.crop) page.setCropBox(...p.crop);
  }
  return (await doc.save()).buffer as ArrayBuffer;
}

/** Text items on each page in *visual* coordinates (after rotation), as a reader sees them — origin top-left. */
async function visualText(pdf: Uint8Array) {
  const doc = await getDocument({ data: pdf.slice(), isEvalSupported: false, useSystemFonts: false }).promise;
  const out: { str: string; x: number; y: number; upright: boolean; width: number; height: number }[][] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    out.push(
      content.items
        .filter((it): it is Extract<typeof it, { str: string }> => "str" in it && it.str.trim() !== "")
        .map((it) => {
          const [a, b, , , e, f] = it.transform;
          const [x, y] = viewport.convertToViewportPoint(e, f);
          // Direction of the text baseline in viewport space; upright text runs left-to-right (+x, no y change).
          const [dx, dy] = viewport.convertToViewportPoint(e + a, f + b);
          return { str: it.str, x, y, upright: dx - x > 0 && Math.abs(dy - y) < 1e-6, width: viewport.width, height: viewport.height };
        })
    );
  }
  return out;
}

describe("PDF page numbers", () => {
  it("formats labels", () => {
    expect(labelFor("n", 3, 10)).toBe("3");
    expect(labelFor("page-n", 3, 10)).toBe("Page 3");
    expect(labelFor("page-n-of-t", 3, 10)).toBe("Page 3 of 10");
    expect(labelFor("n-of-t", 3, 10)).toBe("3 / 10");
  });

  it("numbers every page, upright and near the bottom centre", async () => {
    const { pdf, numbered } = await addPageNumbers(await makePdf([{}, {}, {}]), base);
    expect(numbered).toBe(3);
    const pages = await visualText(pdf);
    pages.forEach((items, i) => {
      expect(items).toHaveLength(1);
      const t = items[0];
      expect(t.str).toBe(String(i + 1));
      expect(t.upright).toBe(true);
      expect(Math.abs(t.x - t.width / 2)).toBeLessThan(15);
      expect(t.height - t.y).toBeLessThan(40); // within ~40pt of the bottom edge
    });
  });

  it.each([90, 180, 270])("keeps numbers upright and in the chosen corner on pages rotated %i°", async (rotate) => {
    const { pdf } = await addPageNumbers(await makePdf([{ rotate }]), { ...base, position: "top-right", format: "page-n-of-t" });
    const [[t]] = await visualText(pdf);
    expect(t.str).toBe("Page 1 of 1");
    expect(t.upright).toBe(true);
    expect(t.x).toBeGreaterThan(t.width * 0.6); // right-hand side as seen by the reader
    expect(t.y).toBeLessThan(60); // top as seen by the reader
  });

  it("places numbers inside a page's crop box, not its full media box", async () => {
    const { pdf } = await addPageNumbers(await makePdf([{ size: [800, 1000], crop: [100, 100, 400, 500] }]), base);
    const [[t]] = await visualText(pdf);
    expect(t.width).toBe(400);
    expect(t.x).toBeGreaterThan(150);
    expect(t.x).toBeLessThan(250);
    expect(t.y).toBeGreaterThan(t.height - 40);
    expect(t.y).toBeLessThan(t.height);
  });

  it("can skip the cover page and start from a custom number", async () => {
    const { pdf, numbered } = await addPageNumbers(await makePdf([{}, {}, {}, {}]), { ...base, skipFirst: true, startAt: 41, format: "page-n-of-t" });
    expect(numbered).toBe(3);
    const pages = await visualText(pdf);
    expect(pages[0]).toHaveLength(0);
    expect(pages.slice(1).map((p) => p[0].str)).toEqual(["Page 41 of 43", "Page 42 of 43", "Page 43 of 43"]);
  });

  it("explains encrypted and invalid files", async () => {
    await expect(addPageNumbers(new TextEncoder().encode("not a pdf").buffer, base)).rejects.toThrow(/couldn't be read as a PDF/);
    const encrypted = new TextEncoder().encode(
      "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\n3 0 obj<</Filter/Standard/V 1/R 2/O(x)/U(x)/P -4>>endobj\ntrailer<</Root 1 0 R/Encrypt 3 0 R>>\n%%EOF"
    );
    await expect(addPageNumbers(encrypted.buffer, base)).rejects.toThrow(/password-protected/);
  });

  it("maps visual points to user space for each rotation", () => {
    const box = { x: 0, y: 0, width: 200, height: 100 };
    expect(toUserSpace(0, box, 10, 20)).toEqual({ x: 10, y: 20, rotate: 0 });
    expect(toUserSpace(90, box, 10, 20)).toEqual({ x: 180, y: 10, rotate: 90 });
    expect(toUserSpace(180, box, 10, 20)).toEqual({ x: 190, y: 80, rotate: 180 });
    expect(toUserSpace(-90, box, 10, 20)).toEqual({ x: 20, y: 90, rotate: 270 });
  });
});
