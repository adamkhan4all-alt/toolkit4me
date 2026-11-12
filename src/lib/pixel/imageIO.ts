// Image input/output helpers for the Pixel Playground tools.

/** Longest side, in pixels, that the tools work at. Larger photos are scaled down to this on load. */
export const MAX_WORKING_SIDE = 4096;
/** Images above this many pixels are refused before decoding fully (protects phones from running out of memory). */
export const MAX_SOURCE_PIXELS = 60_000_000;
export const IMAGE_ACCEPT = [".jpg", ".jpeg", ".png", ".webp"];
export const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"];

export type ImageKind = "jpeg" | "png" | "webp";

/** Identifies JPEG, PNG and WebP from their first bytes — the file extension alone isn't trusted. */
export function sniffImage(bytes: Uint8Array): ImageKind | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((b, i) => bytes[i] === b)) return "png";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "webp";
  return null;
}

export class ImageLoadError extends Error {}

/** Size to draw an image at so its longest side is at most `maxSide`. */
export function fitWithin(width: number, height: number, maxSide: number): { width: number; height: number; scale: number } {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)), scale };
}

/**
 * Validates and decodes an image file into a canvas no larger than
 * MAX_WORKING_SIDE. Photos are drawn with their EXIF orientation applied,
 * so phone pictures come out the right way up.
 */
export async function loadImageFile(file: File, maxSide = MAX_WORKING_SIDE): Promise<HTMLCanvasElement> {
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!sniffImage(head)) throw new ImageLoadError(`"${file.name}" isn't a JPG, PNG or WebP image.`);
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new ImageLoadError(`"${file.name}" couldn't be opened. The file may be damaged.`);
  }
  if (bitmap.width * bitmap.height > MAX_SOURCE_PIXELS) {
    bitmap.close();
    throw new ImageLoadError("This image is too large to edit in the browser (over 60 megapixels). Resize it first with Image Resizer.");
  }
  const { width, height } = fitWithin(bitmap.width, bitmap.height, maxSide);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas;
}

/** A scaled copy of a canvas whose longest side is at most `maxSide` (the same canvas if already small enough). */
export function scaledCopy(source: HTMLCanvasElement, maxSide: number): HTMLCanvasElement {
  const { width, height, scale } = fitWithin(source.width, source.height, maxSide);
  if (scale === 1) return source;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

export type OutputFormat = "png" | "jpeg" | "webp";

export const FORMAT_LABELS: Record<OutputFormat, string> = { png: "PNG", jpeg: "JPG", webp: "WebP" };

export function canvasToBlob(canvas: HTMLCanvasElement, format: OutputFormat, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("The browser couldn't encode the image."))), `image/${format}`, format === "png" ? undefined : quality);
  });
}

/** A new canvas of the given size (with a 2D context ready). */
export function makeCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  return { canvas, ctx };
}

/** Output file name: original base name + a suffix + the format's extension. */
export function outputName(original: string, suffix: string, format: OutputFormat): string {
  const base = original.replace(/\.[^.]+$/, "") || "image";
  return `${base}-${suffix}.${format === "jpeg" ? "jpg" : format}`;
}
