// ---------------------------------------------------------------------
// Pure pixel operations for the Pixel Playground tools. Everything here
// works on plain RGBA buffers (the same layout as canvas ImageData), so
// it runs identically in every browser — no reliance on ctx.filter,
// which Safari only partly supports — and can be unit-tested without a
// canvas.
// ---------------------------------------------------------------------

export interface Pixels {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export function createPixels(width: number, height: number): Pixels {
  return { data: new Uint8ClampedArray(width * height * 4), width, height };
}

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

// --- Colour adjustments -------------------------------------------------

export interface Adjustments {
  /** −100…100 */
  brightness: number;
  /** −100…100 */
  contrast: number;
  /** −100…100 (−100 = greyscale) */
  saturation: number;
  /** −100…100 (negative = cooler/bluer, positive = warmer) */
  warmth: number;
  /** 0…100 — blend towards sepia */
  sepia: number;
  /** 0…100 — darkens the corners */
  vignette: number;
  /** 0…100 — lifts blacks for a faded film look */
  fade: number;
}

export const NEUTRAL_ADJUSTMENTS: Adjustments = { brightness: 0, contrast: 0, saturation: 0, warmth: 0, sepia: 0, vignette: 0, fade: 0 };

/** Applies colour adjustments in place. Alpha is untouched. */
export function adjust(px: Pixels, a: Adjustments): Pixels {
  const { data, width, height } = px;
  const b = (a.brightness / 100) * 255 * 0.5;
  const c = a.contrast / 100;
  const contrastFactor = c >= 0 ? 1 + c * 1.5 : 1 + c; // up to 2.5× or down to 0
  const sat = 1 + a.saturation / 100;
  const warm = (a.warmth / 100) * 30;
  const sepia = a.sepia / 100;
  const fade = (a.fade / 100) * 60;
  const vig = a.vignette / 100;
  const cx = width / 2;
  const cy = height / 2;
  const maxDist = Math.hypot(cx, cy) || 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      let r = data[i];
      let g = data[i + 1];
      let bl = data[i + 2];

      r += b;
      g += b;
      bl += b;

      r = (r - 128) * contrastFactor + 128;
      g = (g - 128) * contrastFactor + 128;
      bl = (bl - 128) * contrastFactor + 128;

      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * bl;
      r = lum + (r - lum) * sat;
      g = lum + (g - lum) * sat;
      bl = lum + (bl - lum) * sat;

      r += warm;
      bl -= warm;

      if (sepia > 0) {
        const sr = 0.393 * r + 0.769 * g + 0.189 * bl;
        const sg = 0.349 * r + 0.686 * g + 0.168 * bl;
        const sb = 0.272 * r + 0.534 * g + 0.131 * bl;
        r += (sr - r) * sepia;
        g += (sg - g) * sepia;
        bl += (sb - bl) * sepia;
      }

      if (fade > 0) {
        r = fade + (r * (255 - fade)) / 255;
        g = fade + (g * (255 - fade)) / 255;
        bl = fade + (bl * (255 - fade)) / 255;
      }

      if (vig > 0) {
        const d = Math.hypot(x - cx, y - cy) / maxDist;
        const k = 1 - vig * Math.max(0, d - 0.35) * 1.4;
        r *= k;
        g *= k;
        bl *= k;
      }

      data[i] = clamp(r);
      data[i + 1] = clamp(g);
      data[i + 2] = clamp(bl);
    }
  }
  return px;
}

// --- Colour-based background removal -----------------------------------

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): Rgb {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return { r: 255, g: 255, b: 255 };
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

/** Euclidean distance between two colours, 0…441. */
export function colourDistance(a: Rgb, b: Rgb): number {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

/** Average colour of the four corners — a good guess for a plain background. */
export function cornerColour(px: Pixels, sample = 4): Rgb {
  const { data, width, height } = px;
  const s = Math.max(1, Math.min(sample, Math.floor(width / 4), Math.floor(height / 4)));
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (const [x0, y0] of [
    [0, 0],
    [width - s, 0],
    [0, height - s],
    [width - s, height - s],
  ]) {
    for (let y = y0; y < y0 + s; y++) {
      for (let x = x0; x < x0 + s; x++) {
        const i = (y * width + x) * 4;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        n++;
      }
    }
  }
  return { r: r / n, g: g / n, b: b / n };
}

/**
 * Makes pixels close to `key` transparent. `tolerance` (0–100) sets how
 * different a colour may be and still count as background; `softness`
 * (0–100) fades the edge instead of cutting it hard. When `connectedOnly`
 * is set, only background touching the image border is removed (a flood
 * fill), so matching colours inside the subject survive.
 */
export function removeColour(px: Pixels, key: Rgb, tolerance: number, softness: number, connectedOnly: boolean): Pixels {
  const { data, width, height } = px;
  const max = 441.67;
  const hard = (tolerance / 100) * max * 0.6;
  const soft = hard + (softness / 100) * max * 0.25;
  const alphaFor = (i: number) => {
    const d = colourDistance({ r: data[i], g: data[i + 1], b: data[i + 2] }, key);
    if (d <= hard) return 0;
    if (d >= soft) return 1;
    return (d - hard) / (soft - hard || 1);
  };

  if (!connectedOnly) {
    for (let i = 0; i < data.length; i += 4) data[i + 3] = Math.round(data[i + 3] * alphaFor(i));
    return px;
  }

  // Flood fill from every border pixel through "background-ish" pixels.
  const visited = new Uint8Array(width * height);
  const stack: number[] = [];
  const pushIf = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (visited[p]) return;
    visited[p] = 1;
    if (alphaFor(p * 4) < 1) stack.push(p);
  };
  for (let x = 0; x < width; x++) {
    pushIf(x, 0);
    pushIf(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    pushIf(0, y);
    pushIf(width - 1, y);
  }
  while (stack.length) {
    const p = stack.pop()!;
    const i = p * 4;
    data[i + 3] = Math.round(data[i + 3] * alphaFor(i));
    const x = p % width;
    const y = (p - x) / width;
    pushIf(x + 1, y);
    pushIf(x - 1, y);
    pushIf(x, y + 1);
    pushIf(x, y - 1);
  }
  return px;
}

// --- Blur, pixelate, sketch ---------------------------------------------

/** Separable box blur of a rectangle (in place), repeated 3× ≈ Gaussian. */
export function blurRegion(px: Pixels, rx: number, ry: number, rw: number, rh: number, radius: number): Pixels {
  const { data, width } = px;
  const x0 = Math.max(0, Math.floor(rx));
  const y0 = Math.max(0, Math.floor(ry));
  const x1 = Math.min(px.width, Math.ceil(rx + rw));
  const y1 = Math.min(px.height, Math.ceil(ry + rh));
  const w = x1 - x0;
  const h = y1 - y0;
  const r = Math.max(1, Math.round(radius));
  if (w <= 0 || h <= 0) return px;
  const buf = new Float32Array(Math.max(w, h) * 4);

  for (let pass = 0; pass < 3; pass++) {
    for (let y = y0; y < y1; y++) {
      for (let x = 0; x < w; x++) for (let c = 0; c < 4; c++) buf[x * 4 + c] = data[(y * width + x0 + x) * 4 + c];
      for (let x = 0; x < w; x++) {
        for (let c = 0; c < 4; c++) {
          let sum = 0;
          let n = 0;
          for (let k = Math.max(0, x - r); k <= Math.min(w - 1, x + r); k++) {
            sum += buf[k * 4 + c];
            n++;
          }
          data[(y * width + x0 + x) * 4 + c] = sum / n;
        }
      }
    }
    for (let x = x0; x < x1; x++) {
      for (let y = 0; y < h; y++) for (let c = 0; c < 4; c++) buf[y * 4 + c] = data[((y0 + y) * width + x) * 4 + c];
      for (let y = 0; y < h; y++) {
        for (let c = 0; c < 4; c++) {
          let sum = 0;
          let n = 0;
          for (let k = Math.max(0, y - r); k <= Math.min(h - 1, y + r); k++) {
            sum += buf[k * 4 + c];
            n++;
          }
          data[((y0 + y) * width + x) * 4 + c] = sum / n;
        }
      }
    }
  }
  return px;
}

/** Replaces each block of `size`×`size` pixels inside the rectangle with its average colour (in place). */
export function pixelateRegion(px: Pixels, rx: number, ry: number, rw: number, rh: number, size: number): Pixels {
  const { data, width } = px;
  const s = Math.max(2, Math.round(size));
  const x0 = Math.max(0, Math.floor(rx));
  const y0 = Math.max(0, Math.floor(ry));
  const x1 = Math.min(px.width, Math.ceil(rx + rw));
  const y1 = Math.min(px.height, Math.ceil(ry + rh));
  for (let by = y0; by < y1; by += s) {
    for (let bx = x0; bx < x1; bx += s) {
      const ex = Math.min(bx + s, x1);
      const ey = Math.min(by + s, y1);
      const sum = [0, 0, 0, 0];
      let n = 0;
      for (let y = by; y < ey; y++)
        for (let x = bx; x < ex; x++) {
          const i = (y * width + x) * 4;
          for (let c = 0; c < 4; c++) sum[c] += data[i + c];
          n++;
        }
      for (let y = by; y < ey; y++)
        for (let x = bx; x < ex; x++) {
          const i = (y * width + x) * 4;
          for (let c = 0; c < 4; c++) data[i + c] = sum[c] / n;
        }
    }
  }
  return px;
}

/**
 * Pencil-sketch effect: greyscale → inverted copy blurred → colour-dodge
 * blend. `detail` (1–20) is the blur radius (higher = softer, broader
 * strokes); `darkness` (0–100) deepens the lines.
 */
export function sketch(px: Pixels, detail: number, darkness: number): Pixels {
  const { data, width, height } = px;
  const grey = new Uint8ClampedArray(width * height);
  for (let p = 0, i = 0; p < grey.length; p++, i += 4) grey[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  const inv = createPixels(width, height);
  for (let p = 0, i = 0; p < grey.length; p++, i += 4) {
    const v = 255 - grey[p];
    inv.data[i] = v;
    inv.data[i + 1] = v;
    inv.data[i + 2] = v;
    inv.data[i + 3] = 255;
  }
  blurRegion(inv, 0, 0, width, height, detail);
  const gamma = 1 + (darkness / 100) * 2;
  for (let p = 0, i = 0; p < grey.length; p++, i += 4) {
    const base = grey[p];
    const blend = inv.data[i];
    let v = blend >= 255 ? 255 : Math.min(255, (base * 255) / (255 - blend));
    v = 255 * Math.pow(v / 255, gamma);
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
  }
  return px;
}

// --- Palette extraction (median cut) ------------------------------------

export interface PaletteColour extends Rgb {
  hex: string;
  /** Share of sampled pixels, 0…1. */
  share: number;
}

/**
 * Dominant colours by median cut. Samples at most ~40,000 opaque pixels
 * (evenly spaced), splits the colour box with the widest channel range
 * until there are `count` boxes, and returns their averages, most common
 * first. Deterministic for the same input.
 */
export function extractPalette(px: Pixels, count: number): PaletteColour[] {
  const { data } = px;
  const total = data.length / 4;
  const step = Math.max(1, Math.floor(total / 40000));
  const samples: number[][] = [];
  for (let p = 0; p < total; p += step) {
    const i = p * 4;
    if (data[i + 3] < 128) continue;
    samples.push([data[i], data[i + 1], data[i + 2]]);
  }
  if (samples.length === 0) return [];
  let boxes: number[][][] = [samples];
  const range = (box: number[][], c: number) => {
    let lo = 255;
    let hi = 0;
    for (const s of box) {
      if (s[c] < lo) lo = s[c];
      if (s[c] > hi) hi = s[c];
    }
    return hi - lo;
  };
  while (boxes.length < count) {
    let best = -1;
    let bestRange = 0;
    let bestChannel = 0;
    boxes.forEach((box, idx) => {
      if (box.length < 2) return;
      for (let c = 0; c < 3; c++) {
        const r = range(box, c);
        if (r > bestRange) {
          bestRange = r;
          best = idx;
          bestChannel = c;
        }
      }
    });
    if (best < 0 || bestRange === 0) break;
    const box = boxes[best].slice().sort((a, b) => a[bestChannel] - b[bestChannel]);
    const mid = Math.floor(box.length / 2);
    boxes = [...boxes.slice(0, best), box.slice(0, mid), box.slice(mid), ...boxes.slice(best + 1)];
  }
  const colours = boxes
    .map((box) => {
      const sum = box.reduce((acc, s) => [acc[0] + s[0], acc[1] + s[1], acc[2] + s[2]], [0, 0, 0]);
      const rgb = { r: Math.round(sum[0] / box.length), g: Math.round(sum[1] / box.length), b: Math.round(sum[2] / box.length) };
      return { ...rgb, hex: rgbToHex(rgb), share: box.length / samples.length };
    })
    .sort((a, b) => b.share - a.share);
  // Median cut can split one visual colour (e.g. white plus anti-aliased edge pixels) into near-identical boxes.
  // Merge colours closer than MERGE_DISTANCE into the more common one, so the palette never repeats a colour.
  const merged: PaletteColour[] = [];
  for (const c of colours) {
    const twin = merged.find((m) => colourDistance(m, c) < MERGE_DISTANCE);
    if (twin) twin.share += c.share;
    else merged.push({ ...c });
  }
  return merged.sort((a, b) => b.share - a.share);
}

/** Colours closer than this (out of 441) are treated as the same palette entry. */
const MERGE_DISTANCE = 18;

/** WCAG relative luminance — used to pick readable text on a swatch. */
export function luminance({ r, g, b }: Rgb): number {
  const ch = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
