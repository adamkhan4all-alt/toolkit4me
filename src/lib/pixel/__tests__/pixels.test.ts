import { describe, expect, it } from "vitest";
import {
  adjust,
  blurRegion,
  colourDistance,
  cornerColour,
  createPixels,
  extractPalette,
  hexToRgb,
  NEUTRAL_ADJUSTMENTS,
  pixelateRegion,
  removeColour,
  rgbToHex,
  sketch,
  type Pixels,
} from "../pixels";

function solid(width: number, height: number, [r, g, b, a = 255]: number[]): Pixels {
  const px = createPixels(width, height);
  for (let i = 0; i < px.data.length; i += 4) px.data.set([r, g, b, a], i);
  return px;
}
const at = (px: Pixels, x: number, y: number) => Array.from(px.data.slice((y * px.width + x) * 4, (y * px.width + x) * 4 + 4));

describe("colour helpers", () => {
  it("converts hex and rgb both ways", () => {
    expect(hexToRgb("#ff8000")).toEqual({ r: 255, g: 128, b: 0 });
    expect(rgbToHex({ r: 255, g: 128, b: 0 })).toBe("#ff8000");
    expect(hexToRgb("nonsense")).toEqual({ r: 255, g: 255, b: 255 });
  });
  it("measures colour distance", () => {
    expect(colourDistance({ r: 0, g: 0, b: 0 }, { r: 0, g: 0, b: 0 })).toBe(0);
    expect(Math.round(colourDistance({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }))).toBe(442);
  });
});

describe("adjust", () => {
  it("leaves pixels unchanged with neutral settings", () => {
    const px = solid(4, 4, [10, 120, 240]);
    adjust(px, NEUTRAL_ADJUSTMENTS);
    expect(at(px, 1, 1)).toEqual([10, 120, 240, 255]);
  });
  it("−100 saturation gives greyscale", () => {
    const px = solid(2, 2, [200, 50, 50]);
    adjust(px, { ...NEUTRAL_ADJUSTMENTS, saturation: -100 });
    const [r, g, b] = at(px, 0, 0);
    expect(r).toBe(g);
    expect(g).toBe(b);
  });
  it("brightness raises values and clamps at 255", () => {
    const px = solid(2, 2, [250, 100, 0]);
    adjust(px, { ...NEUTRAL_ADJUSTMENTS, brightness: 100 });
    const [r, g, b, a] = at(px, 0, 0);
    expect(r).toBe(255);
    expect(g).toBeGreaterThan(100);
    expect(b).toBeGreaterThan(0);
    expect(a).toBe(255);
  });
  it("warmth shifts red up and blue down", () => {
    const px = solid(2, 2, [100, 100, 100]);
    adjust(px, { ...NEUTRAL_ADJUSTMENTS, warmth: 100 });
    const [r, , b] = at(px, 0, 0);
    expect(r).toBeGreaterThan(100);
    expect(b).toBeLessThan(100);
  });
  it("vignette darkens corners more than the centre", () => {
    const px = solid(21, 21, [200, 200, 200]);
    adjust(px, { ...NEUTRAL_ADJUSTMENTS, vignette: 100 });
    expect(at(px, 0, 0)[0]).toBeLessThan(at(px, 10, 10)[0]);
  });
});

describe("removeColour", () => {
  it("makes the background transparent and keeps the subject", () => {
    const px = solid(10, 10, [255, 255, 255]);
    for (let y = 3; y < 7; y++) for (let x = 3; x < 7; x++) px.data.set([200, 20, 20, 255], (y * 10 + x) * 4);
    removeColour(px, cornerColour(px), 20, 0, false);
    expect(at(px, 0, 0)[3]).toBe(0);
    expect(at(px, 5, 5)[3]).toBe(255);
  });
  it("connected mode keeps matching colour enclosed by the subject", () => {
    const px = solid(9, 9, [255, 255, 255]);
    for (let y = 2; y < 7; y++) for (let x = 2; x < 7; x++) if (x === 2 || x === 6 || y === 2 || y === 6) px.data.set([0, 0, 0, 255], (y * 9 + x) * 4);
    removeColour(px, { r: 255, g: 255, b: 255 }, 20, 0, true);
    expect(at(px, 0, 0)[3]).toBe(0);
    expect(at(px, 4, 4)[3]).toBe(255); // white inside the black ring survives
    expect(at(px, 2, 2)[3]).toBe(255);
  });
  it("softness produces partial alpha at the edge", () => {
    const px = solid(1, 1, [235, 235, 235]);
    removeColour(px, { r: 255, g: 255, b: 255 }, 5, 100, false);
    expect(at(px, 0, 0)[3]).toBeGreaterThan(0);
    expect(at(px, 0, 0)[3]).toBeLessThan(255);
  });
});

describe("blur and pixelate", () => {
  it("pixelate makes each block one colour and leaves outside pixels alone", () => {
    const px = createPixels(8, 8);
    for (let i = 0; i < px.data.length; i += 4) px.data.set([(i / 4) % 256, 0, 0, 255], i);
    const outside = at(px, 7, 7);
    pixelateRegion(px, 0, 0, 4, 4, 4);
    expect(at(px, 0, 0)).toEqual(at(px, 3, 3));
    expect(at(px, 7, 7)).toEqual(outside);
  });
  it("blur smooths a hard edge inside the region only", () => {
    const px = solid(20, 4, [0, 0, 0]);
    for (let y = 0; y < 4; y++) for (let x = 10; x < 20; x++) px.data.set([255, 255, 255, 255], (y * 20 + x) * 4);
    blurRegion(px, 5, 0, 10, 4, 3);
    const v = at(px, 10, 1)[0];
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(255);
    expect(at(px, 0, 0)[0]).toBe(0);
    expect(at(px, 19, 0)[0]).toBe(255);
  });
  it("ignores regions outside the image", () => {
    const px = solid(4, 4, [9, 9, 9]);
    expect(() => blurRegion(px, 10, 10, 5, 5, 3)).not.toThrow();
    expect(() => pixelateRegion(px, -10, -10, 5, 5, 3)).not.toThrow();
  });
});

describe("sketch", () => {
  it("turns a flat area white and keeps edges dark, in greyscale", () => {
    const px = solid(30, 30, [220, 180, 160]);
    for (let y = 0; y < 30; y++) px.data.set([10, 10, 10, 255], (y * 30 + 15) * 4);
    sketch(px, 3, 30);
    const flat = at(px, 3, 15);
    const edge = at(px, 15, 15);
    expect(flat[0]).toBe(flat[1]);
    expect(flat[0]).toBeGreaterThan(200);
    expect(edge[0]).toBeLessThan(flat[0]);
  });
});

describe("extractPalette", () => {
  it("finds the two colours of a half-and-half image with their shares", () => {
    const px = solid(20, 10, [255, 0, 0]);
    for (let y = 0; y < 10; y++) for (let x = 10; x < 20; x++) px.data.set([0, 0, 255, 255], (y * 20 + x) * 4);
    const palette = extractPalette(px, 2);
    expect(palette.map((c) => c.hex).sort()).toEqual(["#0000ff", "#ff0000"]);
    expect(palette[0].share).toBeCloseTo(0.5, 1);
  });
  it("returns fewer colours when the image has fewer", () => {
    expect(extractPalette(solid(5, 5, [1, 2, 3]), 6)).toHaveLength(1);
  });
  it("never repeats near-identical colours (anti-aliased edges)", () => {
    const px = solid(40, 40, [255, 255, 255]);
    for (let i = 0; i < 40 * 40; i += 7) px.data.set([252, 253, 255, 255], i * 4);
    for (let y = 10; y < 30; y++) for (let x = 10; x < 30; x++) px.data.set([220, 38, 38, 255], (y * 40 + x) * 4);
    const palette = extractPalette(px, 6);
    for (let i = 0; i < palette.length; i++) for (let j = i + 1; j < palette.length; j++) expect(colourDistance(palette[i], palette[j])).toBeGreaterThanOrEqual(18);
    expect(palette.reduce((sum, c) => sum + c.share, 0)).toBeCloseTo(1, 5);
  });
  it("ignores transparent pixels", () => {
    expect(extractPalette(solid(5, 5, [1, 2, 3, 0]), 4)).toEqual([]);
  });
});
