import { describe, expect, it } from "vitest";
import { pointOnContainedCanvas } from "../regions";

describe("pointOnContainedCanvas", () => {
  it("maps directly when the element and canvas share an aspect ratio", () => {
    const rect = { left: 100, top: 50, width: 400, height: 200 };
    expect(pointOnContainedCanvas(300, 150, rect, 800, 400)).toEqual({ x: 0.5, y: 0.5 });
    expect(pointOnContainedCanvas(100, 50, rect, 800, 400)).toEqual({ x: 0, y: 0 });
  });

  it("accounts for side letterboxing of a tall image (the blur-tool regression)", () => {
    // A 1000×1100 canvas shown in a 670×520 box: drawn 472.7 px wide, centred, with ~98.6 px empty on each side.
    const rect = { left: 89, top: 157, width: 670, height: 520 };
    const shownW = 1000 * (520 / 1100);
    const left = 89 + (670 - shownW) / 2;
    const p = pointOnContainedCanvas(left + shownW * 0.05, 157 + 520 * 0.2, rect, 1000, 1100);
    expect(p.x).toBeCloseTo(0.05, 5);
    expect(p.y).toBeCloseTo(0.2, 5);
  });

  it("accounts for top/bottom letterboxing of a wide image", () => {
    const rect = { left: 0, top: 0, width: 400, height: 400 };
    // 800×400 canvas → drawn 400×200, 100 px empty above and below.
    expect(pointOnContainedCanvas(200, 200, rect, 800, 400)).toEqual({ x: 0.5, y: 0.5 });
    expect(pointOnContainedCanvas(0, 100, rect, 800, 400)).toEqual({ x: 0, y: 0 });
  });

  it("clamps pointers in the empty margins to the image edge", () => {
    const rect = { left: 89, top: 157, width: 670, height: 520 };
    expect(pointOnContainedCanvas(90, 300, rect, 1000, 1100).x).toBe(0);
    expect(pointOnContainedCanvas(758, 300, rect, 1000, 1100).x).toBe(1);
  });
});
