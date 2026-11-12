import { makeCanvas } from "../imageIO";
import { shorterSide, type StudioSpec } from "../studio";

type Values = { style: string; width: number; colour: string; accent: string; radius: number };

export function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

const spec: StudioSpec<Values> = {
  defaults: { style: "solid", width: 5, colour: "#ffffff", accent: "#111827", radius: 6 },
  presets: [
    { label: "Clean white", values: { style: "solid", width: 5, colour: "#ffffff" } },
    { label: "Polaroid", values: { style: "polaroid", width: 5, colour: "#fbfaf7" } },
    { label: "Gallery mat", values: { style: "double", width: 9, colour: "#f5f5f4", accent: "#1f2937" } },
    { label: "Rounded card", values: { style: "rounded", width: 4, colour: "#ffffff", radius: 8 } },
    { label: "Black", values: { style: "solid", width: 3, colour: "#000000" } },
  ],
  controls: (v) => [
    {
      type: "select",
      key: "style",
      label: "Style",
      options: [
        { value: "solid", label: "Even border" },
        { value: "polaroid", label: "Instant photo (deeper bottom)" },
        { value: "double", label: "Mat with inner line" },
        { value: "rounded", label: "Rounded corners" },
      ],
    },
    { type: "range", key: "width", label: "Border width", min: 1, max: 20, unit: "% of the shorter side" },
    { type: "color", key: "colour", label: "Border colour" },
    ...(v.style === "double" ? [{ type: "color" as const, key: "accent", label: "Inner line colour" }] : []),
    ...(v.style === "rounded" ? [{ type: "range" as const, key: "radius", label: "Corner radius", min: 1, max: 30, unit: "%" }] : []),
  ],
  formats: ["png", "jpeg", "webp"],
  fileSuffix: "framed",
  render(source, v) {
    const b = Math.round((shorterSide(source) * v.width) / 100);
    const bottom = v.style === "polaroid" ? Math.round(b * 3.5) : b;
    const W = source.width + 2 * b;
    const H = source.height + b + bottom;
    const { canvas, ctx } = makeCanvas(W, H);
    if (v.style === "rounded") {
      const r = (shorterSide(canvas) * v.radius) / 100;
      roundedRect(ctx, 0, 0, W, H, r);
      ctx.fillStyle = v.colour;
      ctx.fill();
      ctx.save();
      roundedRect(ctx, b, b, source.width, source.height, Math.max(0, r - b));
      ctx.clip();
      ctx.drawImage(source, b, b);
      ctx.restore();
      return canvas;
    }
    ctx.fillStyle = v.colour;
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(source, b, b);
    if (v.style === "double") {
      const inset = Math.max(1, Math.round(b * 0.35));
      ctx.strokeStyle = v.accent;
      ctx.lineWidth = Math.max(1, Math.round(b * 0.06));
      ctx.strokeRect(b - inset, b - inset, source.width + 2 * inset, source.height + 2 * inset);
    }
    return canvas;
  },
};

export default spec;
