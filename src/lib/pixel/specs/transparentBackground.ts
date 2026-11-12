import { makeCanvas } from "../imageIO";
import { cornerColour, hexToRgb, removeColour, rgbToHex } from "../pixels";
import type { StudioSpec } from "../studio";

type Values = { colour: string; tolerance: number; softness: number; connected: boolean };

const spec: StudioSpec<Values> = {
  // An empty colour means "use the average colour of the corners".
  defaults: { colour: "", tolerance: 15, softness: 20, connected: true },
  controls: [
    { type: "color", key: "colour", label: "Background colour to remove" },
    { type: "range", key: "tolerance", label: "Tolerance", min: 0, max: 100, unit: "%" },
    { type: "range", key: "softness", label: "Edge softness", min: 0, max: 100, unit: "%" },
    {
      type: "toggle",
      key: "connected",
      label: "Only remove background touching the edges",
      help: "Keeps areas of the same colour inside your subject, such as white text on a white logo.",
    },
  ],
  formats: ["png", "webp"],
  fileSuffix: "transparent",
  showOriginal: true,
  pickHint: "Tip: click the background in the original image to choose the colour to remove.",
  pick: (hit) => ({ colour: hit.hex }),
  initFromSource: (source) => ({ colour: defaultKey(source) }),
  render(source, v) {
    const { canvas, ctx } = makeCanvas(source.width, source.height);
    ctx.drawImage(source, 0, 0);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = { data: img.data, width: img.width, height: img.height };
    const key = v.colour ? hexToRgb(v.colour) : cornerColour(px);
    removeColour(px, key, v.tolerance, v.softness, v.connected);
    ctx.putImageData(img, 0, 0);
    return canvas;
  },
};

/** The colour the tool would remove by default, for showing in the colour control before the visitor picks one. */
export function defaultKey(source: HTMLCanvasElement): string {
  const ctx = source.getContext("2d")!;
  const img = ctx.getImageData(0, 0, source.width, source.height);
  return rgbToHex(cornerColour({ data: img.data, width: img.width, height: img.height }));
}

export default spec;
