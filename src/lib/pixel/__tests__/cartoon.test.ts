import { describe, expect, it } from "vitest";
import { boxBlurRgb, cartoon, dilate, edgeMask, luminanceMap, posterizeValue, styleOptions } from "../cartoon";
import { createPixels, type Pixels } from "../pixels";

/** Left half black, right half white — one sharp vertical edge. */
function split(w = 20, h = 10): Pixels {
  const px = createPixels(w, h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const v = x < w / 2 ? 0 : 255;
      px.data[i] = px.data[i + 1] = px.data[i + 2] = v;
      px.data[i + 3] = 255;
    }
  return px;
}

describe("cartoon effect building blocks", () => {
  it("posterizes to evenly spaced band centres", () => {
    expect(posterizeValue(0, 4)).toBe(32);
    expect(posterizeValue(255, 4)).toBe(223);
    expect(new Set(Array.from({ length: 256 }, (_, v) => posterizeValue(v, 4))).size).toBe(4);
    expect(new Set(Array.from({ length: 256 }, (_, v) => posterizeValue(v, 99))).size).toBe(12); // clamped
  });

  it("box blur keeps flat areas unchanged and softens edges, without touching alpha", () => {
    const px = split();
    px.data[3] = 7;
    const out = boxBlurRgb(px, 2);
    expect(out.data[(5 * 20 + 0) * 4]).toBe(0);
    expect(out.data[(5 * 20 + 19) * 4]).toBe(255);
    const nearEdge = out.data[(5 * 20 + 10) * 4];
    expect(nearEdge).toBeGreaterThan(0);
    expect(nearEdge).toBeLessThan(255);
    expect(out.data[3]).toBe(7);
    expect(boxBlurRgb(px, 0).data).toEqual(px.data);
  });

  it("finds the edge, not the flat areas, and threshold 1 disables lines", () => {
    const px = split();
    const mask = edgeMask(luminanceMap(px), 20, 10, 0.2);
    expect(mask[5 * 20 + 9] || mask[5 * 20 + 10]).toBe(1);
    expect(mask[5 * 20 + 2]).toBe(0);
    expect(mask[5 * 20 + 17]).toBe(0);
    expect(edgeMask(luminanceMap(px), 20, 10, 1).every((v) => v === 0)).toBe(true);
  });

  it("dilate thickens a mask by r pixels", () => {
    const m = new Uint8Array(25);
    m[12] = 1; // centre of 5×5
    expect(dilate(m, 5, 5, 1).reduce((a, b) => a + b, 0)).toBe(9);
    expect(dilate(m, 5, 5, 0)).toBe(m);
  });

  it("produces flat colour bands with dark outlines on the edge, and keeps size and alpha", () => {
    const px = split(40, 20);
    const out = cartoon(px, { smoothRadius: 1, levels: 4, saturation: 0, edgeThreshold: 0.15, lineWidth: 2, ink: { r: 10, g: 10, b: 10 } });
    expect(out.width).toBe(40);
    expect(out.height).toBe(20);
    const centreRow = 10 * 40;
    expect(out.data[(centreRow + 20) * 4]).toBe(10); // ink on the edge
    expect([0, 32, 96, 159, 223]).toContain(out.data[(centreRow + 2) * 4]); // banded value away from the edge (pure black stays black)
    expect(out.data[(centreRow + 37) * 4]).toBe(223); // white is banded to the top level
    expect(out.data[3]).toBe(255);
  });

  it("monochrome style removes colour", () => {
    const px = createPixels(8, 8);
    for (let i = 0; i < px.data.length; i += 4) {
      px.data[i] = 220;
      px.data[i + 1] = 40;
      px.data[i + 2] = 40;
      px.data[i + 3] = 255;
    }
    const out = cartoon(px, { ...styleOptions("manga", 8), edgeThreshold: 1 });
    expect(out.data[0]).toBe(out.data[1]);
    expect(out.data[1]).toBe(out.data[2]);
  });

  it("style options scale with the image and line strength 0 turns lines off", () => {
    const small = styleOptions("cel", 500);
    const big = styleOptions("cel", 2000);
    expect(big.smoothRadius).toBeGreaterThan(small.smoothRadius);
    expect(big.lineWidth).toBeGreaterThanOrEqual(small.lineWidth);
    expect(styleOptions("cel", 500, { lineStrength: 0 }).edgeThreshold).toBe(1);
    expect(styleOptions("cel", 500, { lineStrength: 100 }).edgeThreshold).toBeLessThan(small.edgeThreshold);
  });
});
