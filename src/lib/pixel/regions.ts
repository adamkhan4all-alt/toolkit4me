import { blurRegion, pixelateRegion, type Pixels } from "./pixels";

/** A region in image-relative coordinates (0–1), so it maps onto the preview and the full-size image alike. */
export interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
}
export type Mode = "pixelate" | "blur" | "box";

/** Applies the privacy effect to every region of a canvas (in place). Strength 1–10. */
export function applyRegions(canvas: HTMLCanvasElement, regions: Region[], mode: Mode, strength: number) {
  const ctx = canvas.getContext("2d")!;
  const s = Math.min(canvas.width, canvas.height);
  if (mode === "box") {
    ctx.fillStyle = "#000000";
    for (const r of regions) ctx.fillRect(r.x * canvas.width, r.y * canvas.height, r.w * canvas.width, r.h * canvas.height);
    return;
  }
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px: Pixels = { data: img.data, width: img.width, height: img.height };
  for (const r of regions) {
    const args = [r.x * canvas.width, r.y * canvas.height, r.w * canvas.width, r.h * canvas.height] as const;
    if (mode === "pixelate") pixelateRegion(px, ...args, Math.max(4, (s * strength) / 200));
    else blurRegion(px, ...args, Math.max(2, (s * strength) / 250));
  }
  ctx.putImageData(img, 0, 0);
}
