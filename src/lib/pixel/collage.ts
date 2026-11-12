// Collage layouts: each layout is a list of cells in a 0–1 coordinate space.

export interface Cell {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CollageLayout {
  id: string;
  label: string;
  photos: number;
  cells: Cell[];
}

const grid = (cols: number, rows: number): Cell[] =>
  Array.from({ length: cols * rows }, (_, i) => ({ x: (i % cols) / cols, y: Math.floor(i / cols) / rows, w: 1 / cols, h: 1 / rows }));

export const COLLAGE_LAYOUTS: CollageLayout[] = [
  { id: "2-side", label: "2 side by side", photos: 2, cells: grid(2, 1) },
  { id: "2-stack", label: "2 stacked", photos: 2, cells: grid(1, 2) },
  { id: "3-row", label: "3 in a row", photos: 3, cells: grid(3, 1) },
  { id: "1-big-2", label: "1 large + 2 small", photos: 3, cells: [{ x: 0, y: 0, w: 2 / 3, h: 1 }, { x: 2 / 3, y: 0, w: 1 / 3, h: 0.5 }, { x: 2 / 3, y: 0.5, w: 1 / 3, h: 0.5 }] },
  { id: "2x2", label: "2 × 2 grid", photos: 4, cells: grid(2, 2) },
  { id: "1-top-3", label: "1 wide + 3 below", photos: 4, cells: [{ x: 0, y: 0, w: 1, h: 0.6 }, ...grid(3, 1).map((c) => ({ ...c, y: 0.6, h: 0.4 }))] },
  { id: "3x2", label: "3 × 2 grid", photos: 6, cells: grid(3, 2) },
  { id: "3x3", label: "3 × 3 grid", photos: 9, cells: grid(3, 3) },
];

/**
 * Pixel rectangles for a layout on a canvas of `width` × `height`, with
 * `gap` pixels between cells and around the outside. Edges are rounded to
 * whole pixels so neighbouring cells line up exactly.
 */
export function layoutCells(layout: CollageLayout, width: number, height: number, gap: number): Cell[] {
  const innerW = width - gap;
  const innerH = height - gap;
  return layout.cells.map((c) => {
    const x0 = Math.round(gap + c.x * innerW);
    const y0 = Math.round(gap + c.y * innerH);
    const x1 = Math.round(gap + (c.x + c.w) * innerW) - gap;
    const y1 = Math.round(gap + (c.y + c.h) * innerH) - gap;
    return { x: x0, y: y0, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) };
  });
}

/** Smallest layout that fits `count` photos, or the first layout with exactly that many. */
export function defaultLayoutFor(count: number): CollageLayout {
  return COLLAGE_LAYOUTS.find((l) => l.photos === count) ?? COLLAGE_LAYOUTS.find((l) => l.photos >= count) ?? COLLAGE_LAYOUTS[COLLAGE_LAYOUTS.length - 1];
}

export const COLLAGE_SIZES = [
  { id: "square", label: "Square 1080 × 1080 (Instagram post)", width: 1080, height: 1080 },
  { id: "portrait", label: "Portrait 1080 × 1350 (Instagram 4:5)", width: 1080, height: 1350 },
  { id: "story", label: "Story 1080 × 1920", width: 1080, height: 1920 },
  { id: "landscape", label: "Landscape 1920 × 1080", width: 1920, height: 1080 },
];
