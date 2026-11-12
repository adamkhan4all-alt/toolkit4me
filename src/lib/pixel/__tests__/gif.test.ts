import { describe, expect, it } from "vitest";
import { GIFEncoder, applyPalette, quantize } from "gifenc";
import { MAX_CLIP_SECONDS, estimateGifBytes, frameDelay, frameTimes, gifSize } from "../gif";

describe("frameTimes", () => {
  it("captures fps frames per second between start and end", () => {
    const t = frameTimes(1, 3, 10, 60);
    expect(t).toHaveLength(20);
    expect(t[0]).toBe(1);
    expect(t[1]).toBeCloseTo(1.1, 5);
  });
  it("never runs past the clip limit", () => {
    expect(frameTimes(0, 100, 10, 100)).toHaveLength(MAX_CLIP_SECONDS * 10);
  });
  it("stays inside a short video's duration", () => {
    const t = frameTimes(0, 10, 10, 2);
    expect(t).toHaveLength(20);
    expect(Math.max(...t)).toBeLessThan(2);
  });
  it("returns nothing for an empty or reversed range", () => {
    expect(frameTimes(5, 5, 10, 60)).toEqual([]);
    expect(frameTimes(6, 4, 10, 60)).toEqual([]);
  });
});

describe("gif sizing", () => {
  it("frame delay is in whole hundredths of a second", () => {
    expect(frameDelay(10)).toBe(100);
    expect(frameDelay(15)).toBe(70);
    expect(frameDelay(8)).toBe(130);
  });
  it("keeps aspect ratio with even dimensions and never upscales", () => {
    expect(gifSize(1920, 1080, 480)).toEqual({ width: 480, height: 270 });
    expect(gifSize(320, 240, 640)).toEqual({ width: 320, height: 240 });
    const s = gifSize(1080, 1920, 320);
    expect(s.width % 2).toBe(0);
    expect(s.height % 2).toBe(0);
  });
  it("estimates size from pixels and frames", () => {
    expect(estimateGifBytes(100, 100, 10)).toBe(60000);
  });
});

describe("gifenc", () => {
  it("encodes a valid two-frame looping GIF", () => {
    const w = 8;
    const h = 8;
    const enc = GIFEncoder();
    for (const colour of [[255, 0, 0], [0, 0, 255]]) {
      const rgba = new Uint8ClampedArray(w * h * 4);
      for (let i = 0; i < rgba.length; i += 4) rgba.set([...colour, 255], i);
      const palette = quantize(rgba, 256);
      enc.writeFrame(applyPalette(rgba, palette), w, h, { palette, delay: 100, repeat: 0 });
    }
    enc.finish();
    const bytes = enc.bytes();
    expect(String.fromCharCode(...bytes.slice(0, 6))).toBe("GIF89a");
    expect(bytes[6] | (bytes[7] << 8)).toBe(w);
    expect(bytes[bytes.length - 1]).toBe(0x3b); // GIF trailer
    expect(String.fromCharCode(...bytes).includes("NETSCAPE2.0")).toBe(true); // loop extension
  });
});
