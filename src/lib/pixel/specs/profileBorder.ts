import { makeCanvas } from "../imageIO";
import type { StudioSpec } from "../studio";

type Values = { size: string; zoom: number; offsetX: number; offsetY: number; ring: number; style: string; colour1: string; colour2: string; gap: number };

const spec: StudioSpec<Values> = {
  defaults: { size: "1024", zoom: 100, offsetX: 0, offsetY: 0, ring: 6, style: "gradient", colour1: "#4f46e5", colour2: "#ec4899", gap: 1.5 },
  presets: [
    { label: "Indigo → pink", values: { style: "gradient", colour1: "#4f46e5", colour2: "#ec4899" } },
    { label: "Sunset", values: { style: "gradient", colour1: "#f97316", colour2: "#e11d48" } },
    { label: "Ocean", values: { style: "gradient", colour1: "#06b6d4", colour2: "#2563eb" } },
    { label: "Green", values: { style: "solid", colour1: "#16a34a" } },
    { label: "Gold", values: { style: "gradient", colour1: "#facc15", colour2: "#b45309" } },
  ],
  controls: (v) => [
    { type: "range", key: "zoom", label: "Zoom", min: 100, max: 300, unit: "%" },
    { type: "range", key: "offsetX", label: "Move left / right", min: -50, max: 50 },
    { type: "range", key: "offsetY", label: "Move up / down", min: -50, max: 50 },
    {
      type: "select",
      key: "style",
      label: "Ring style",
      options: [
        { value: "gradient", label: "Gradient" },
        { value: "solid", label: "Solid colour" },
      ],
    },
    { type: "color", key: "colour1", label: v.style === "gradient" ? "Start colour" : "Ring colour" },
    ...(v.style === "gradient" ? [{ type: "color" as const, key: "colour2", label: "End colour" }] : []),
    { type: "range", key: "ring", label: "Ring thickness", min: 1, max: 15, step: 0.5, unit: "%" },
    { type: "range", key: "gap", label: "White gap inside the ring", min: 0, max: 5, step: 0.5, unit: "%" },
    {
      type: "select",
      key: "size",
      label: "Output size",
      options: [
        { value: "512", label: "512 × 512 px" },
        { value: "1024", label: "1024 × 1024 px" },
      ],
    },
  ],
  formats: ["png", "webp"],
  fileSuffix: "profile",
  render(source, v, { preview }) {
    // The preview is drawn at 512 px whatever the setting; the download uses the chosen size.
    const S = preview ? 512 : Number(v.size);
    const { canvas, ctx } = makeCanvas(S, S);
    const c = S / 2;
    const ringW = (S * v.ring) / 100;
    const gapW = (S * v.gap) / 100;

    ctx.beginPath();
    ctx.arc(c, c, c, 0, Math.PI * 2);
    if (v.style === "gradient") {
      const grad = ctx.createLinearGradient(0, 0, S, S);
      grad.addColorStop(0, v.colour1);
      grad.addColorStop(1, v.colour2);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = v.colour1;
    }
    ctx.fill();

    ctx.beginPath();
    ctx.arc(c, c, c - ringW, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    const inner = c - ringW - gapW;
    ctx.save();
    ctx.beginPath();
    ctx.arc(c, c, inner, 0, Math.PI * 2);
    ctx.clip();
    // Cover-fit the photo into the inner circle, then apply zoom and offsets.
    const scale = ((inner * 2) / Math.min(source.width, source.height)) * (v.zoom / 100);
    const w = source.width * scale;
    const h = source.height * scale;
    const maxX = Math.max(0, (w - inner * 2) / 2);
    const maxY = Math.max(0, (h - inner * 2) / 2);
    const x = c - w / 2 - (v.offsetX / 50) * maxX;
    const y = c - h / 2 - (v.offsetY / 50) * maxY;
    ctx.drawImage(source, x, y, w, h);
    ctx.restore();
    return canvas;
  },
};

export default spec;
