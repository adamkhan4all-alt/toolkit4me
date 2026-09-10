// ---------------------------------------------------------------------
// Client-side image processing.
//
// Everything here runs entirely in the browser using the Canvas API —
// no external library needed, and the file being processed never leaves
// the device. Used by Compress Image, JPG to PNG, and PNG to JPG.
// ---------------------------------------------------------------------

export class ImageProcessingError extends Error {}

export interface ImageDimensions {
  width: number;
  height: number;
}

const MIME_BY_FORMAT: Record<"jpeg" | "png", string> = {
  jpeg: "image/jpeg",
  png: "image/png",
};

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

function drawToCanvas(img: HTMLImageElement, maxWidth?: number): HTMLCanvasElement {
  let { naturalWidth: width, naturalHeight: height } = img;

  if (maxWidth && width > maxWidth) {
    const ratio = maxWidth / width;
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new ImageProcessingError("Your browser doesn't support the canvas features this tool needs.");
  }
  // PNG -> JPEG needs an opaque background since JPEG has no alpha channel.
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
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
  format: "jpeg" | "png";
  /** 0–1, only meaningful for JPEG output. */
  quality?: number;
  /** Downscale so width never exceeds this many pixels; omit to keep original size. */
  maxWidth?: number;
}

export interface ConvertImageResult {
  blob: Blob;
  width: number;
  height: number;
}

export async function convertImage(file: File, options: ConvertImageOptions): Promise<ConvertImageResult> {
  const img = await loadImage(file);
  const canvas = drawToCanvas(img, options.maxWidth);
  const mime = MIME_BY_FORMAT[options.format];
  const blob = await canvasToBlob(canvas, mime, options.format === "jpeg" ? options.quality ?? 0.9 : undefined);
  return { blob, width: canvas.width, height: canvas.height };
}

export function extensionForFormat(format: "jpeg" | "png"): string {
  return format === "jpeg" ? "jpg" : "png";
}

export function replaceExtension(fileName: string, newExtension: string): string {
  const base = fileName.replace(/\.[^/.]+$/, "");
  return `${base}.${newExtension}`;
}
