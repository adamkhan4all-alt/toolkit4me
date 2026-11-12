// Text layout helpers for canvas tools (memes, stories, thumbnails).

/**
 * Splits text into lines that fit `maxWidth`, breaking at spaces and
 * honouring explicit line breaks. A single word wider than the line is
 * kept whole on its own line rather than cut mid-word.
 */
export function wrapLines(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }
    let line = words[0];
    for (const word of words.slice(1)) {
      const candidate = `${line} ${word}`;
      if (measure(candidate) <= maxWidth) line = candidate;
      else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

/**
 * Largest font size (≤ `maxSize`, ≥ `minSize`) at which the wrapped text
 * fits inside `maxWidth` × `maxHeight`. `measureAt(size)` returns a
 * width-measuring function for that size.
 */
export function fitFontSize(
  text: string,
  maxWidth: number,
  maxHeight: number,
  maxSize: number,
  minSize: number,
  lineHeight: number,
  measureAt: (size: number) => (s: string) => number
): { size: number; lines: string[] } {
  for (let size = Math.floor(maxSize); size > minSize; size -= Math.max(1, Math.floor(size / 20))) {
    const measure = measureAt(size);
    const lines = wrapLines(text, maxWidth, measure);
    if (lines.length * size * lineHeight <= maxHeight && lines.every((l) => measure(l) <= maxWidth)) return { size, lines };
  }
  return { size: minSize, lines: wrapLines(text, maxWidth, measureAt(minSize)) };
}

export interface TextBlockOptions {
  x: number;
  y: number;
  maxWidth: number;
  maxHeight: number;
  maxSize: number;
  minSize?: number;
  align: CanvasTextAlign;
  /** Vertical anchor of the block at `y`. */
  anchor: "top" | "middle" | "bottom";
  font: (size: number) => string;
  fill: string;
  stroke?: string;
  /** Stroke width as a fraction of the font size. */
  strokeRatio?: number;
  lineHeight?: number;
  shadow?: string;
  /** Extra space between letters as a fraction of the font size (ignored by browsers without canvas letterSpacing). */
  letterSpacing?: number;
}

/** Draws auto-sized, wrapped text. Returns the font size used. */
export function drawTextBlock(ctx: CanvasRenderingContext2D, text: string, o: TextBlockOptions): number {
  if (!text.trim()) return 0;
  const lineHeight = o.lineHeight ?? 1.12;
  const spacing = (size: number) => {
    if (o.letterSpacing && "letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${size * o.letterSpacing}px`;
  };
  const measureAt = (size: number) => {
    ctx.font = o.font(size);
    spacing(size);
    return (s: string) => ctx.measureText(s).width;
  };
  const { size, lines } = fitFontSize(text, o.maxWidth, o.maxHeight, o.maxSize, o.minSize ?? 10, lineHeight, measureAt);
  ctx.save();
  ctx.font = o.font(size);
  spacing(size);
  ctx.textAlign = o.align;
  ctx.textBaseline = "top";
  ctx.lineJoin = "round";
  const blockHeight = lines.length * size * lineHeight;
  const top = o.anchor === "top" ? o.y : o.anchor === "middle" ? o.y - blockHeight / 2 : o.y - blockHeight;
  if (o.shadow) {
    ctx.shadowColor = o.shadow;
    ctx.shadowBlur = size * 0.25;
    ctx.shadowOffsetY = size * 0.05;
  }
  lines.forEach((line, i) => {
    const ly = top + i * size * lineHeight;
    if (o.stroke) {
      ctx.strokeStyle = o.stroke;
      ctx.lineWidth = size * (o.strokeRatio ?? 0.12);
      ctx.strokeText(line, o.x, ly);
    }
    ctx.fillStyle = o.fill;
    ctx.fillText(line, o.x, ly);
  });
  ctx.restore();
  if (o.letterSpacing && "letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
  return size;
}

/** Draws `source` to fill the rectangle (cropping the overflow), with zoom (≥1) and offsets (−50…50). */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource & { width: number; height: number },
  x: number,
  y: number,
  w: number,
  h: number,
  zoom = 1,
  offsetX = 0,
  offsetY = 0
) {
  const scale = Math.max(w / source.width, h / source.height) * zoom;
  const dw = source.width * scale;
  const dh = source.height * scale;
  const maxX = (dw - w) / 2;
  const maxY = (dh - h) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(source, x + (w - dw) / 2 - (offsetX / 50) * maxX, y + (h - dh) / 2 - (offsetY / 50) * maxY, dw, dh);
  ctx.restore();
}

/** Draws `source` scaled to fit entirely inside the rectangle (letterboxed), centred. */
export function drawContain(ctx: CanvasRenderingContext2D, source: CanvasImageSource & { width: number; height: number }, x: number, y: number, w: number, h: number) {
  const scale = Math.min(w / source.width, h / source.height);
  const dw = source.width * scale;
  const dh = source.height * scale;
  ctx.drawImage(source, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}
