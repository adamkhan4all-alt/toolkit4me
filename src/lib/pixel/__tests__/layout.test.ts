import { describe, expect, it } from "vitest";
import { fitFontSize, wrapLines } from "../text";
import { COLLAGE_LAYOUTS, defaultLayoutFor, layoutCells } from "../collage";

// A fake "font": every character is 10 units wide at size 10, scaling linearly.
const measureAt = (size: number) => (s: string) => s.length * size;

describe("wrapLines", () => {
  it("wraps at spaces to fit the width", () => {
    expect(wrapLines("one two three four", 90, measureAt(10))).toEqual(["one two", "three", "four"]);
  });
  it("keeps explicit line breaks and empty lines", () => {
    expect(wrapLines("a\n\nb", 100, measureAt(10))).toEqual(["a", "", "b"]);
  });
  it("puts a too-long word on its own line instead of cutting it", () => {
    expect(wrapLines("hi supercalifragilistic yo", 50, measureAt(10))).toEqual(["hi", "supercalifragilistic", "yo"]);
  });
});

describe("fitFontSize", () => {
  it("uses the largest size that fits", () => {
    const { size, lines } = fitFontSize("HELLO", 100, 100, 50, 5, 1, measureAt);
    expect(size * 5).toBeLessThanOrEqual(100);
    expect(lines).toEqual(["HELLO"]);
  });
  it("shrinks long text to fit the height", () => {
    const { size, lines } = fitFontSize("word ".repeat(30).trim(), 200, 120, 80, 5, 1.1, measureAt);
    expect(lines.length * size * 1.1).toBeLessThanOrEqual(120);
    expect(size).toBeGreaterThan(5);
  });
});

describe("collage layouts", () => {
  it("every layout has as many cells as photos, inside the unit square, without overlaps", () => {
    for (const layout of COLLAGE_LAYOUTS) {
      expect(layout.cells, layout.id).toHaveLength(layout.photos);
      const area = layout.cells.reduce((s, c) => s + c.w * c.h, 0);
      expect(area, layout.id).toBeCloseTo(1, 5);
      for (const c of layout.cells) {
        expect(c.x + c.w).toBeLessThanOrEqual(1 + 1e-9);
        expect(c.y + c.h).toBeLessThanOrEqual(1 + 1e-9);
      }
    }
  });
  it("pixel cells keep an even gap and stay inside the canvas", () => {
    const layout = COLLAGE_LAYOUTS.find((l) => l.id === "2x2")!;
    const cells = layoutCells(layout, 1080, 1080, 20);
    expect(cells[0]).toEqual({ x: 20, y: 20, w: 510, h: 510 });
    expect(cells[1].x - (cells[0].x + cells[0].w)).toBe(20);
    for (const c of cells) {
      expect(c.x + c.w).toBeLessThanOrEqual(1080 - 20);
      expect(c.y + c.h).toBeLessThanOrEqual(1080 - 20);
    }
  });
  it("zero gap tiles the canvas exactly", () => {
    const cells = layoutCells(COLLAGE_LAYOUTS.find((l) => l.id === "3x3")!, 1000, 1000, 0);
    expect(cells.reduce((s, c) => s + c.w * c.h, 0)).toBe(1000 * 1000);
  });
  it("picks a sensible default layout for a photo count", () => {
    expect(defaultLayoutFor(4).photos).toBe(4);
    expect(defaultLayoutFor(5).photos).toBe(6);
    expect(defaultLayoutFor(20).photos).toBe(9);
  });
});
