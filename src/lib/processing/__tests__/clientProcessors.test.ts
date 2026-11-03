import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CLIENT_PROCESSORS, getClientProcessor } from "../clientProcessors";

class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 300;
  naturalHeight = 200;
  set src(_v: string) {
    queueMicrotask(() => this.onload?.());
  }
}

function stubBrowserImageApis() {
  vi.stubGlobal("Image", FakeImage);
  vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:ok"), revokeObjectURL: vi.fn() });
  const fakeCtx = { fillStyle: "", fillRect: vi.fn(), drawImage: vi.fn() };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(fakeCtx as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (callback: BlobCallback) {
    callback(new Blob(["y".repeat(500)], { type: "image/jpeg" }));
  });
}

describe("getClientProcessor", () => {
  it("returns a processor for each of the 5 client-side tools", () => {
    for (const id of ["compress-image", "jpg-to-png", "png-to-jpg", "jpg-to-pdf", "split-pdf"]) {
      expect(getClientProcessor(id)).toBeDefined();
    }
  });

  it("returns undefined for a tool without a registered processor", () => {
    expect(getClientProcessor("pdf-to-word")).toBeUndefined();
  });

  it("registry exposes exactly the expected keys", () => {
    expect(Object.keys(CLIENT_PROCESSORS).sort()).toEqual(
      ["compress-image", "jpg-to-pdf", "jpg-to-png", "png-to-jpg", "split-pdf", "image-resizer", "pdf-page-numbers", "webp-converter"].sort()
    );
  });
});

describe("image-resizer processor", () => {
  beforeEach(stubBrowserImageApis);
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  const file = () => new File(["x"], "my.photo.jpg", { type: "image/jpeg" });
  const resize = (values: Record<string, string>) =>
    getClientProcessor("image-resizer")!([file()], { values: { width: "", height: "", fit: "contain", outputFormat: "original", ...values } });

  it("resizes by width, keeping the aspect ratio, and names the file with its new size", async () => {
    const [out] = await resize({ width: "150" });
    expect(out).toMatchObject({ width: 150, height: 100, fileName: "my.photo-150x100.jpg" });
  });

  it("stretches to an exact size and switches format when asked", async () => {
    const [out] = await resize({ width: "64", height: "64", fit: "exact", outputFormat: "png" });
    expect(out).toMatchObject({ width: 64, height: 64, fileName: "my.photo-64x64.png" });
  });

  it("rejects invalid or missing dimensions with a clear message", async () => {
    await expect(resize({ width: "abc" })).rejects.toThrow(/whole number of pixels/);
    await expect(resize({ width: "0" })).rejects.toThrow(/between 1 and 20,000/);
    await expect(resize({})).rejects.toThrow(/Enter a width/);
  });

  it("refuses outputs larger than browsers can safely allocate", async () => {
    await expect(resize({ width: "20000", height: "20000", fit: "exact" })).rejects.toThrow(/16.7 megapixels/);
  });

  it("errors clearly when the browser can't encode WebP instead of returning a mislabelled file", async () => {
    await expect(resize({ width: "100", outputFormat: "webp" })).rejects.toThrow(/can't create WebP/);
  });
});

describe("compressImage processor", () => {
  beforeEach(stubBrowserImageApis);
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("defaults to keeping the source format when outputFormat is 'original'", async () => {
    const processor = getClientProcessor("compress-image")!;
    const file = new File(["x"], "photo.jpg", { type: "image/jpeg" });
    const [result] = await processor([file], { quality: 70, outputFormat: "original" });
    expect(result.fileName).toBe("photo.jpg");
    expect(result.originalSizeBytes).toBe(file.size);
    expect(result.outputSizeBytes).toBeGreaterThan(0);
  });

  it("renames the output file when forcing a different format", async () => {
    const processor = getClientProcessor("compress-image")!;
    const file = new File(["x"], "photo.jpg", { type: "image/jpeg" });
    const [result] = await processor([file], { quality: 70, outputFormat: "png" });
    expect(result.fileName).toBe("photo.png");
  });

  it("processes every file in a batch and returns one result each", async () => {
    const processor = getClientProcessor("compress-image")!;
    const files = [
      new File(["x"], "a.jpg", { type: "image/jpeg" }),
      new File(["x"], "b.png", { type: "image/png" }),
    ];
    const results = await processor(files, { quality: 80, outputFormat: "original" });
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.fileName)).toEqual(["a.jpg", "b.png"]);
  });
});

describe("jpgToPng / pngToJpg processors", () => {
  beforeEach(stubBrowserImageApis);
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("jpg-to-png renames to .png", async () => {
    const processor = getClientProcessor("jpg-to-png")!;
    const [result] = await processor([new File(["x"], "photo.JPG", { type: "image/jpeg" })], {});
    expect(result.fileName).toBe("photo.png");
  });

  it("png-to-jpg renames to .jpg", async () => {
    const processor = getClientProcessor("png-to-jpg")!;
    const [result] = await processor([new File(["x"], "photo.png", { type: "image/png" })], {});
    expect(result.fileName).toBe("photo.jpg");
  });
});
