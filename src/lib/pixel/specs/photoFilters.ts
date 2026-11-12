import { adjust, type Adjustments } from "../pixels";
import { makeCanvas } from "../imageIO";
import type { StudioSpec } from "../studio";

type Values = Adjustments & Record<string, number>;

const NONE: Values = { brightness: 0, contrast: 0, saturation: 0, warmth: 0, sepia: 0, vignette: 0, fade: 0 };

const spec: StudioSpec<Values> = {
  defaults: NONE,
  presets: [
    { label: "Original", values: NONE },
    { label: "Vivid", values: { ...NONE, contrast: 15, saturation: 35 } },
    { label: "Warm", values: { ...NONE, warmth: 40, saturation: 10 } },
    { label: "Cool", values: { ...NONE, warmth: -40, contrast: 5 } },
    { label: "Golden hour", values: { ...NONE, warmth: 55, brightness: 8, vignette: 25 } },
    { label: "Mono", values: { ...NONE, saturation: -100, contrast: 10 } },
    { label: "Noir", values: { ...NONE, saturation: -100, contrast: 45, vignette: 50 } },
    { label: "Sepia", values: { ...NONE, sepia: 80, contrast: 5 } },
    { label: "Faded film", values: { ...NONE, fade: 45, contrast: -15, saturation: -20 } },
    { label: "Dreamy", values: { ...NONE, brightness: 12, contrast: -20, fade: 25, saturation: -10 } },
  ],
  controls: [
    { type: "range", key: "brightness", label: "Brightness", min: -100, max: 100 },
    { type: "range", key: "contrast", label: "Contrast", min: -100, max: 100 },
    { type: "range", key: "saturation", label: "Saturation", min: -100, max: 100 },
    { type: "range", key: "warmth", label: "Warmth", min: -100, max: 100 },
    { type: "range", key: "sepia", label: "Sepia", min: 0, max: 100 },
    { type: "range", key: "fade", label: "Fade", min: 0, max: 100 },
    { type: "range", key: "vignette", label: "Vignette", min: 0, max: 100 },
  ],
  formats: ["jpeg", "png", "webp"],
  fileSuffix: "filtered",
  render(source, values) {
    const { canvas, ctx } = makeCanvas(source.width, source.height);
    ctx.drawImage(source, 0, 0);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    adjust({ data: img.data, width: img.width, height: img.height }, values);
    ctx.putImageData(img, 0, 0);
    return canvas;
  },
};

export default spec;
