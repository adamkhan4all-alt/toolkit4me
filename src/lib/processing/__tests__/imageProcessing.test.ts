import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  convertImage,
  extensionForFormat,
  getImageDimensions,
  ImageProcessingError,
  loadImage,
  replaceExtension,
} from "../imageProcessing";

// jsdom doesn't implement image decoding or a real 2D canvas context, so we
// stub just enough of the browser surface for these functions to exercise
// their real logic (scaling math, mime selection, error propagation)
// without needing an actual browser.
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 0;
  naturalHeight = 0;
  private _src = "";

  set src(value: string) {
    this._src = value;
    if (value === "blob:fail") {
      queueMicrotask(() => this.onerror?.());
    } else {
      queueMicrotask(() => this.onload?.());
    }
  }
  get src() {
    return this._src;
  }
}

function stubCanvas(toBlobBehavior: "success" | "null" = "success") {
  const fakeCtx = {
    fillStyle: "",
    fillRect: vi.fn(),
    drawImage: vi.fn(),
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(fakeCtx as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
    this: HTMLCanvasElement,
    callback: BlobCallback
  ) {
    if (toBlobBehavior === "null") {
      callback(null);
    } else {
      callback(new Blob(["x".repeat(1000)], { type: "image/jpeg" }));
    }
  });
}

describe("imageProcessing", () => {
  beforeEach(() => {
    vi.stubGlobal("Image", FakeImage);
    vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:ok"), revokeObjectURL: vi.fn() });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("loadImage resolves with a decoded image", async () => {
    const img = await loadImage(new File(["x"], "photo.jpg", { type: "image/jpeg" }));
    expect(img).toBeInstanceOf(FakeImage);
  });

  it("loadImage rejects with ImageProcessingError on decode failure", async () => {
    vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:fail"), revokeObjectURL: vi.fn() });
    await expect(loadImage(new File(["x"], "broken.jpg", { type: "image/jpeg" }))).rejects.toBeInstanceOf(
      ImageProcessingError
    );
  });

  it("getImageDimensions reads the decoded image's natural size", async () => {
    class SizedImage extends FakeImage {
      naturalWidth = 1600;
      naturalHeight = 900;
    }
    vi.stubGlobal("Image", SizedImage);
    const dims = await getImageDimensions(new File(["x"], "wide.jpg", { type: "image/jpeg" }));
    expect(dims).toEqual({ width: 1600, height: 900 });
  });

  it("convertImage keeps original dimensions when no maxWidth is given", async () => {
    class SizedImage extends FakeImage {
      naturalWidth = 800;
      naturalHeight = 600;
    }
    vi.stubGlobal("Image", SizedImage);
    stubCanvas();

    const { width, height, blob } = await convertImage(new File(["x"], "a.jpg", { type: "image/jpeg" }), {
      format: "jpeg",
      quality: 0.8,
    });
    expect(width).toBe(800);
    expect(height).toBe(600);
    expect(blob.size).toBeGreaterThan(0);
  });

  it("convertImage downscales proportionally when maxWidth is smaller than the original", async () => {
    class SizedImage extends FakeImage {
      naturalWidth = 2000;
      naturalHeight = 1000;
    }
    vi.stubGlobal("Image", SizedImage);
    stubCanvas();

    const { width, height } = await convertImage(new File(["x"], "a.jpg", { type: "image/jpeg" }), {
      format: "jpeg",
      maxWidth: 500,
    });
    expect(width).toBe(500);
    expect(height).toBe(250); // aspect ratio preserved (2:1)
  });

  it("convertImage does not upscale when maxWidth exceeds the original width", async () => {
    class SizedImage extends FakeImage {
      naturalWidth = 400;
      naturalHeight = 300;
    }
    vi.stubGlobal("Image", SizedImage);
    stubCanvas();

    const { width, height } = await convertImage(new File(["x"], "a.jpg", { type: "image/jpeg" }), {
      format: "png",
      maxWidth: 4000,
    });
    expect(width).toBe(400);
    expect(height).toBe(300);
  });

  it("convertImage rejects with ImageProcessingError when canvas encoding fails", async () => {
    class SizedImage extends FakeImage {
      naturalWidth = 100;
      naturalHeight = 100;
    }
    vi.stubGlobal("Image", SizedImage);
    stubCanvas("null");

    await expect(
      convertImage(new File(["x"], "a.jpg", { type: "image/jpeg" }), { format: "jpeg" })
    ).rejects.toBeInstanceOf(ImageProcessingError);
  });

  it("extensionForFormat maps jpeg/png correctly", () => {
    expect(extensionForFormat("jpeg")).toBe("jpg");
    expect(extensionForFormat("png")).toBe("png");
  });

  it("replaceExtension swaps only the trailing extension", () => {
    expect(replaceExtension("photo.jpeg", "png")).toBe("photo.png");
    expect(replaceExtension("my.photo.name.PNG", "jpg")).toBe("my.photo.name.jpg");
  });
});
