/// <reference lib="webworker" />
// Encodes GIF frames off the main thread so the page stays responsive.
// Protocol: "start" → many "frame" (RGBA buffers, transferred) → "finish";
// replies "progress" after each frame and "done" with the GIF bytes.
import { GIFEncoder, applyPalette, quantize } from "gifenc";

type InMessage = { type: "start"; width: number; height: number; delay: number } | { type: "frame"; data: ArrayBuffer } | { type: "finish" };

let encoder = GIFEncoder();
let width = 0;
let height = 0;
let delay = 100;
let frames = 0;

self.onmessage = (e: MessageEvent<InMessage>) => {
  const msg = e.data;
  if (msg.type === "start") {
    encoder = GIFEncoder();
    width = msg.width;
    height = msg.height;
    delay = msg.delay;
    frames = 0;
  } else if (msg.type === "frame") {
    const rgba = new Uint8ClampedArray(msg.data);
    // A palette per frame keeps colours accurate when the scene changes.
    const palette = quantize(rgba, 256);
    const index = applyPalette(rgba, palette);
    encoder.writeFrame(index, width, height, { palette, delay, repeat: 0 });
    frames++;
    self.postMessage({ type: "progress", frames });
  } else if (msg.type === "finish") {
    encoder.finish();
    const bytes = encoder.bytes();
    const out = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    self.postMessage({ type: "done", bytes: out }, { transfer: [out] });
  }
};
