import { makeCanvas } from "../imageIO";
import { shorterSide, type StudioSpec } from "../studio";
import { roundedRect } from "./borderFrame";
import { hexToRgb } from "../pixels";

type Values = { offsetX: number; offsetY: number; blur: number; colour: string; opacity: number; padding: number; radius: number; background: string; bgColour: string };

const spec: StudioSpec<Values> = {
  defaults: { offsetX: 0, offsetY: 3, blur: 6, colour: "#000000", opacity: 35, padding: 12, radius: 3, background: "transparent", bgColour: "#f3f4f6" },
  presets: [
    { label: "Soft", values: { offsetX: 0, offsetY: 3, blur: 6, opacity: 35 } },
    { label: "Floating", values: { offsetX: 0, offsetY: 8, blur: 12, opacity: 30 } },
    { label: "Hard drop", values: { offsetX: 3, offsetY: 3, blur: 0, opacity: 80 } },
    { label: "Glow", values: { offsetX: 0, offsetY: 0, blur: 10, opacity: 70, colour: "#6366f1" } },
  ],
  controls: (v) => [
    { type: "range", key: "offsetX", label: "Horizontal offset", min: -15, max: 15, unit: "%" },
    { type: "range", key: "offsetY", label: "Vertical offset", min: -15, max: 15, unit: "%" },
    { type: "range", key: "blur", label: "Softness", min: 0, max: 20, unit: "%" },
    { type: "range", key: "opacity", label: "Shadow strength", min: 0, max: 100, unit: "%" },
    { type: "color", key: "colour", label: "Shadow colour" },
    { type: "range", key: "radius", label: "Corner rounding", min: 0, max: 25, unit: "%" },
    { type: "range", key: "padding", label: "Space around the image", min: 2, max: 40, unit: "%" },
    {
      type: "select",
      key: "background",
      label: "Background",
      options: [
        { value: "transparent", label: "Transparent (PNG/WebP)" },
        { value: "solid", label: "Solid colour" },
      ],
    },
    ...(v.background === "solid" ? [{ type: "color" as const, key: "bgColour", label: "Background colour" }] : []),
  ],
  formats: ["png", "webp", "jpeg"],
  fileSuffix: "shadow",
  render(source, v) {
    const s = shorterSide(source);
    const pad = Math.round((s * v.padding) / 100);
    const { canvas, ctx } = makeCanvas(source.width + 2 * pad, source.height + 2 * pad);
    if (v.background === "solid") {
      ctx.fillStyle = v.bgColour;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const { r, g, b } = hexToRgb(v.colour);
    const radius = (s * v.radius) / 100;
    ctx.save();
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${v.opacity / 100})`;
    ctx.shadowBlur = (s * v.blur) / 100;
    ctx.shadowOffsetX = (s * v.offsetX) / 100;
    ctx.shadowOffsetY = (s * v.offsetY) / 100;
    roundedRect(ctx, pad, pad, source.width, source.height, radius);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();
    ctx.save();
    roundedRect(ctx, pad, pad, source.width, source.height, radius);
    ctx.clip();
    ctx.drawImage(source, pad, pad);
    ctx.restore();
    return canvas;
  },
};

export default spec;
