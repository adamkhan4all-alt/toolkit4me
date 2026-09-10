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

  it("registry exposes exactly the 5 expected keys", () => {
    expect(Object.keys(CLIENT_PROCESSORS).sort()).toEqual(
      ["compress-image", "jpg-to-pdf", "jpg-to-png", "png-to-jpg", "split-pdf"].sort()
    );
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
