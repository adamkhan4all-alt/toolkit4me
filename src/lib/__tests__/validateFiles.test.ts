import { describe, expect, it } from "vitest";
import { validateFiles } from "../validateFiles";
import { toolRegistry } from "../toolRegistry";

const jpgToPng = toolRegistry.getBySlug("jpg-to-png")!; // multiple, image/jpeg, 25MB
const pdfToWord = toolRegistry.getBySlug("pdf-to-word")!; // single, application/pdf, 50MB

function makeFile(name: string, sizeBytes: number, type: string): File {
  return new File([new Uint8Array(Math.max(1, sizeBytes))], name, { type });
}

describe("validateFiles", () => {
  it("accepts a matching, in-limit file", () => {
    const file = makeFile("a.jpg", 1024, "image/jpeg");
    const result = validateFiles(jpgToPng, [file], 0);
    expect(result.error).toBeUndefined();
    expect(result.valid).toEqual([file]);
  });

  it("rejects a file whose type doesn't match acceptedMime/format", () => {
    const file = makeFile("a.png", 1024, "image/png");
    const result = validateFiles(jpgToPng, [file], 0);
    expect(result.error?.message).toMatch(/isn't a supported file type/);
  });

  it("rejects a file over the tool's max size", () => {
    const oversized = makeFile("big.jpg", 26 * 1024 * 1024, "image/jpeg");
    const result = validateFiles(jpgToPng, [oversized], 0);
    expect(result.error?.message).toMatch(/exceeds the 25MB limit/);
  });

  it("rejects an empty file", () => {
    const empty = new File([], "empty.jpg", { type: "image/jpeg" });
    const result = validateFiles(jpgToPng, [empty], 0);
    expect(result.error?.message).toMatch(/is empty/);
  });

  it("rejects a second file for a single-file tool", () => {
    const first = makeFile("a.pdf", 1024, "application/pdf");
    const result = validateFiles(pdfToWord, [first], 1);
    expect(result.error?.message).toMatch(/only one file at a time/);
  });

  it("allows multiple files for a multi-file tool", () => {
    const a = makeFile("a.jpg", 1024, "image/jpeg");
    const b = makeFile("b.jpg", 2048, "image/jpeg");
    const result = validateFiles(jpgToPng, [a, b], 0);
    expect(result.error).toBeUndefined();
    expect(result.valid).toEqual([a, b]);
  });
});
