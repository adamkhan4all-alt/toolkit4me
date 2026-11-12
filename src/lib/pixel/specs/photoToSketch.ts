import { makeCanvas } from "../imageIO";
import { sketch } from "../pixels";
import { shorterSide, type StudioSpec } from "../studio";

type Values = { detail: number; darkness: number; mode: string };

const spec: StudioSpec<Values> = {
  defaults: { detail: 4, darkness: 30, mode: "pencil" },
  presets: [
    { label: "Fine pencil", values: { detail: 2, darkness: 20, mode: "pencil" } },
    { label: "Soft pencil", values: { detail: 6, darkness: 35, mode: "pencil" } },
    { label: "Bold lines", values: { detail: 3, darkness: 80, mode: "pencil" } },
    { label: "Coloured pencil", values: { detail: 4, darkness: 30, mode: "colour" } },
  ],
  controls: [
    {
      type: "select",
      key: "mode",
      label: "Style",
      options: [
        { value: "pencil", label: "Pencil (black and white)" },
        { value: "colour", label: "Coloured pencil" },
      ],
    },
    { type: "range", key: "detail", label: "Stroke width", min: 1, max: 12 },
    { type: "range", key: "darkness", label: "Line darkness", min: 0, max: 100, unit: "%" },
  ],
  formats: ["jpeg", "png", "webp"],
  fileSuffix: "sketch",
  showOriginal: true,
  render(source, v) {
    const { canvas, ctx } = makeCanvas(source.width, source.height);
    ctx.drawImage(source, 0, 0);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const original = v.mode === "colour" ? new Uint8ClampedArray(img.data) : null;
    // Stroke width scales with the photo so the preview and the full-size download match.
    const radius = Math.max(1, Math.round((shorterSide(source) / 600) * v.detail));
    sketch({ data: img.data, width: img.width, height: img.height }, radius, v.darkness);
    if (original) {
      // Coloured pencil: tint the sketch with the photo's own (lightened) colours.
      for (let i = 0; i < img.data.length; i += 4) {
        const k = img.data[i] / 255;
        for (let c = 0; c < 3; c++) img.data[i + c] = Math.round(k * (155 + original[i + c] * 0.4));
      }
    }
    ctx.putImageData(img, 0, 0);
    return canvas;
  },
};

export default spec;
