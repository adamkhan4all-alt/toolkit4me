// ---------------------------------------------------------------------
// Anime-style cartoon effect — classic image processing, NOT AI.
//
//   1. smooth   — separable box blur (running sums, O(pixels)) flattens
//                 skin, fabric and background texture into areas;
//   2. colours  — saturation boost, then each channel is reduced to a few
//                 levels (posterize), giving flat "cel" colour bands;
//   3. ink      — Sobel edges of the lightly blurred brightness, above a
//                 threshold, thickened and drawn as dark outlines.
//
// Owner decision D7 (docs/RELEASE_6_AUDIT.md): no commercially licensed
// anime model exists, so this is shipped and described as an effect.
// Pure functions on RGBA buffers, so they're unit-tested without a canvas.
// ---------------------------------------------------------------------
import type { Pixels } from "./pixels";

export interface CartoonOptions {
  /** Blur radius in pixels for the colour layer (0 = none). */
  smoothRadius: number;
  /** Colour levels per channel (2–12). Fewer = flatter. */
  levels: number;
  /** −100…100: negative desaturates, positive makes colours more vivid. */
  saturation: number;
  /** Edge threshold on a 0–1 scale of gradient strength; lower = more lines. 1 disables lines. */
  edgeThreshold: number;
  /** Outline thickness in pixels (≥ 1). */
  lineWidth: number;
  /** Outline colour. */
  ink: { r: number; g: number; b: number };
  /** Convert the colour layer to grey before posterizing (manga look). */
  monochrome?: boolean;
}

/** One horizontal-then-vertical box blur pass over RGB (alpha kept), radius r, using running sums. */
export function boxBlurRgb(src: Pixels, r: number): Pixels {
  const { width: w, height: h } = src;
  if (r < 1 || w === 0 || h === 0) return { width: w, height: h, data: new Uint8ClampedArray(src.data) };
  const tmp = new Float32Array(w * h * 3);
  const out = new Uint8ClampedArray(src.data);
  const d = src.data;
  // Horizontal pass: d → tmp.
  for (let y = 0; y < h; y++) {
    for (let c = 0; c < 3; c++) {
      let sum = 0;
      for (let k = -r; k <= r; k++) sum += d[(y * w + Math.min(w - 1, Math.max(0, k))) * 4 + c];
      for (let x = 0; x < w; x++) {
        tmp[(y * w + x) * 3 + c] = sum / (2 * r + 1);
        const addX = Math.min(w - 1, x + r + 1);
        const subX = Math.max(0, x - r);
        sum += d[(y * w + addX) * 4 + c] - d[(y * w + subX) * 4 + c];
      }
    }
  }
  // Vertical pass: tmp → out.
  for (let x = 0; x < w; x++) {
    for (let c = 0; c < 3; c++) {
      let sum = 0;
      for (let k = -r; k <= r; k++) sum += tmp[(Math.min(h - 1, Math.max(0, k)) * w + x) * 3 + c];
      for (let y = 0; y < h; y++) {
        out[(y * w + x) * 4 + c] = sum / (2 * r + 1);
        const addY = Math.min(h - 1, y + r + 1);
        const subY = Math.max(0, y - r);
        sum += tmp[(addY * w + x) * 3 + c] - tmp[(subY * w + x) * 3 + c];
      }
    }
  }
  return { width: w, height: h, data: out };
}

/** Luminance (0–255) of every pixel. */
export function luminanceMap(px: Pixels): Float32Array {
  const n = px.width * px.height;
  const lum = new Float32Array(n);
  for (let i = 0; i < n; i++) lum[i] = 0.299 * px.data[i * 4] + 0.587 * px.data[i * 4 + 1] + 0.114 * px.data[i * 4 + 2];
  return lum;
}

/** Sobel gradient magnitude normalised to 0–1, thresholded into an edge mask (1 = edge). */
export function edgeMask(lum: Float32Array, w: number, h: number, threshold: number): Uint8Array {
  const mask = new Uint8Array(w * h);
  if (threshold >= 1) return mask;
  // Max Sobel magnitude for 0–255 input is about 1443; normalise against that.
  const limit = threshold * 1443;
  const at = (x: number, y: number) => lum[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const gx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1);
      const gy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1);
      if (Math.hypot(gx, gy) > limit) mask[y * w + x] = 1;
    }
  }
  return mask;
}

/** Thickens a mask by `r` pixels (square neighbourhood), separably. */
export function dilate(mask: Uint8Array, w: number, h: number, r: number): Uint8Array {
  if (r < 1) return mask;
  const horiz = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!mask[y * w + x]) continue;
      for (let k = Math.max(0, x - r); k <= Math.min(w - 1, x + r); k++) horiz[y * w + k] = 1;
    }
  const out = new Uint8Array(w * h);
  for (let x = 0; x < w; x++)
    for (let y = 0; y < h; y++) {
      if (!horiz[y * w + x]) continue;
      for (let k = Math.max(0, y - r); k <= Math.min(h - 1, y + r); k++) out[k * w + x] = 1;
    }
  return out;
}

/** Maps 0–255 to `levels` evenly spaced values (each band takes its middle value). */
export function posterizeValue(v: number, levels: number): number {
  const n = Math.max(2, Math.min(12, Math.round(levels)));
  const band = Math.min(n - 1, Math.floor((v / 256) * n));
  return Math.round(((band + 0.5) / n) * 255);
}

export function cartoon(src: Pixels, o: CartoonOptions): Pixels {
  const { width: w, height: h } = src;
  // Two box-blur passes ≈ a soft Gaussian, so flat areas don't get blocky.
  const smooth = o.smoothRadius >= 1 ? boxBlurRgb(boxBlurRgb(src, Math.round(o.smoothRadius)), Math.round(o.smoothRadius)) : boxBlurRgb(src, 0);
  // Edges come from a lightly blurred copy, so fine texture (pores, grain) doesn't become ink.
  const edgeSource = boxBlurRgb(src, Math.max(1, Math.round(Math.min(w, h) / 600)));
  const mask = dilate(edgeMask(luminanceMap(edgeSource), w, h, o.edgeThreshold), w, h, Math.max(0, Math.round(o.lineWidth) - 1));

  const out = smooth.data;
  const sat = 1 + o.saturation / 100;
  for (let i = 0, p = 0; p < w * h; p++, i += 4) {
    let r = out[i];
    let g = out[i + 1];
    let b = out[i + 2];
    const grey = 0.299 * r + 0.587 * g + 0.114 * b;
    if (o.monochrome) {
      const q = posterizeValue(grey, o.levels);
      out[i] = out[i + 1] = out[i + 2] = q;
    } else {
      r = Math.max(0, Math.min(255, grey + (r - grey) * sat));
      g = Math.max(0, Math.min(255, grey + (g - grey) * sat));
      b = Math.max(0, Math.min(255, grey + (b - grey) * sat));
      // Cel shading: band the brightness (the strongest channel) and scale all three channels together, so each area
      // keeps its own hue. Banding channels separately would shift hues and put green/purple patches on skin.
      const v = Math.max(r, g, b);
      const k = v > 0 ? posterizeValue(v, o.levels) / v : 0;
      out[i] = Math.min(255, r * k);
      out[i + 1] = Math.min(255, g * k);
      out[i + 2] = Math.min(255, b * k);
    }
    if (mask[p]) {
      out[i] = o.ink.r;
      out[i + 1] = o.ink.g;
      out[i + 2] = o.ink.b;
    }
    out[i + 3] = src.data[i + 3];
  }
  return { width: w, height: h, data: out };
}

/** Named looks shared by Picture to Anime and Picture Avatar's cartoon style. Sizes scale with the image. */
export const CARTOON_STYLES = {
  cel: { label: "Cel-shaded (vivid)", levels: 5, saturation: 35, smooth: 0.9, edge: 0.1, line: 0.2, monochrome: false },
  soft: { label: "Soft pastel", levels: 7, saturation: 10, smooth: 0.7, edge: 0.11, line: 0.14, monochrome: false },
  bold: { label: "Bold comic", levels: 4, saturation: 60, smooth: 0.7, edge: 0.07, line: 0.3, monochrome: false },
  manga: { label: "Manga ink (black & white)", levels: 3, saturation: 0, smooth: 0.7, edge: 0.1, line: 0.2, monochrome: true },
} as const;

export type CartoonStyle = keyof typeof CARTOON_STYLES;

/** Options for a named style on an image whose shorter side is `side` px. `smooth` and `line` are % of that side. */
export function styleOptions(style: CartoonStyle, side: number, overrides: { levels?: number; lineStrength?: number; lineWidthPct?: number; smoothPct?: number } = {}): CartoonOptions {
  const s = CARTOON_STYLES[style];
  const strength = overrides.lineStrength ?? 50; // 0 = no lines, 100 = most lines
  return {
    smoothRadius: Math.round((side * (overrides.smoothPct ?? s.smooth)) / 100),
    levels: overrides.levels ?? s.levels,
    saturation: s.saturation,
    // Strength 50 = the style's own threshold; 0 disables lines; 100 halves the threshold (more lines).
    edgeThreshold: strength <= 0 ? 1 : s.edge * (strength >= 50 ? 1 - (strength - 50) / 100 : 1 + (50 - strength) / 25),
    lineWidth: Math.max(1, Math.round((side * (overrides.lineWidthPct ?? s.line)) / 100)),
    ink: { r: 26, g: 22, b: 38 },
    monochrome: s.monochrome,
  };
}
