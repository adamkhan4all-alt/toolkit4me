// ---------------------------------------------------------------------
// Client-side image processing.
//
// Everything here runs entirely in the browser using the Canvas API —
// no external library needed, and the file being processed never leaves
// the device. Used by Compress Image, JPG to PNG, PNG to JPG, Image
// Resizer and WebP Converter.
// ---------------------------------------------------------------------

import { UserFacingError } from "./errors";

export class ImageProcessingError extends UserFacingError {}

export interface ImageDimensions {
  width: number;
  height: number;
}

export type ImageFormat = "jpeg" | "png" | "webp";

const MIME_BY_FORMAT: Record<ImageFormat, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/**
 * Largest canvas we'll allocate, in pixels. iOS Safari refuses canvases
 * above ~16.7 million pixels (4096 × 4096), and big canvases are the main
 * memory risk on low-end phones, so every resize/convert stays under it.
 */
export const MAX_CANVAS_PIXELS = 16_777_216;

/**
 * Decodes a File into an HTMLImageElement via an object URL. Rejects with
 * ImageProcessingError for corrupted/unreadable files so callers can show
 * a clear, actionable error instead of a generic failure.
 */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImageProcessingError(`"${file.name}" couldn't be read. The file may be corrupted or isn't a valid image.`));
    };
    img.src = url;
  });
}

export async function getImageDimensions(file: File): Promise<ImageDimensions> {
  const img = await loadImage(file);
  return { width: img.naturalWidth, height: img.naturalHeight };
}

function createCanvas(width: number, height: number, format: ImageFormat): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  if (width * height > MAX_CANVAS_PIXELS) {
    throw new ImageProcessingError(
      `The output would be ${width} × ${height} pixels, which is more than browsers can safely handle (about 16.7 megapixels). Choose a smaller size.`
    );
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new ImageProcessingError("Your browser doesn't support the canvas features this tool needs.");
  }
  // JPEG has no alpha channel, so transparent areas need an opaque (white)
  // background. PNG and WebP output keep their transparency — filling it
  // white would flatten e.g. a transparent logo run through Compress Image.
  if (format === "jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { canvas, ctx };
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new ImageProcessingError("Encoding failed. Try a different file or a lower quality setting."));
          return;
        }
        resolve(blob);
      },
      mime,
      quality
    );
  });
}

export interface ConvertImageOptions {
  format: ImageFormat;
  /** 0–1, only meaningful for JPEG and WebP output. */
  quality?: number;
  /** Downscale so width never exceeds this many pixels; omit to keep original size. */
  maxWidth?: number;
  /** Image Resizer's request (takes precedence over maxWidth) — see resolveResize. */
  resize?: { width?: number; height?: number; fit: "contain" | "exact" };
}

export interface ConvertImageResult {
  blob: Blob;
  width: number;
  height: number;
}

function targetSize(img: HTMLImageElement, options: ConvertImageOptions): ImageDimensions {
  if (options.resize) return resolveResize({ width: img.naturalWidth, height: img.naturalHeight }, options.resize);
  let { naturalWidth: width, naturalHeight: height } = img;
  if (options.maxWidth && width > options.maxWidth) {
    const ratio = options.maxWidth / width;
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }
  return { width, height };
}

export async function convertImage(file: File, options: ConvertImageOptions): Promise<ConvertImageResult> {
  const img = await loadImage(file);
  const { width, height } = targetSize(img, options);
  const { canvas, ctx } = createCanvas(width, height, options.format);
  ctx.drawImage(img, 0, 0, width, height);

  const lossy = options.format === "jpeg" || options.format === "webp";
  const blob = await canvasToBlob(canvas, MIME_BY_FORMAT[options.format], lossy ? options.quality ?? 0.9 : undefined);
  // Free the canvas backing store now rather than waiting for GC — matters on low-memory phones.
  canvas.width = 0;
  canvas.height = 0;

  // Browsers that can't encode a format silently fall back to PNG; never hand that back labelled as WebP.
  if (options.format === "webp" && blob.type !== "image/webp") {
    throw new ImageProcessingError(
      "This browser can't create WebP images (older Safari versions can't). Try Chrome, Edge or Firefox, or choose JPG or PNG instead."
    );
  }
  return { blob, width, height };
}

export function extensionForFormat(format: ImageFormat): string {
  return format === "jpeg" ? "jpg" : format;
}

export function replaceExtension(fileName: string, newExtension: string): string {
  const base = fileName.replace(/\.[^/.]+$/, "");
  return `${base}.${newExtension}`;
}

/**
 * Works out the output size for Image Resizer. `fit: "contain"` keeps the
 * aspect ratio inside the requested box (a blank side is calculated from
 * the other); `fit: "exact"` uses both numbers as given, which can stretch.
 */
export function resolveResize(
  original: ImageDimensions,
  request: { width?: number; height?: number; fit: "contain" | "exact" }
): ImageDimensions {
  const { width, height, fit } = request;
  if (!width && !height) {
    throw new ImageProcessingError("Enter a width, a height, or both.");
  }
  if (fit === "exact" && width && height) return { width, height };
  const scale = Math.min(width ? width / original.width : Infinity, height ? height / original.height : Infinity);
  return {
    width: Math.max(1, Math.round(original.width * scale)),
    height: Math.max(1, Math.round(original.height * scale)),
  };
}
