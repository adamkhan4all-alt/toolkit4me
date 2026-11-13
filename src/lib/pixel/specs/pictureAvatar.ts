import { cartoon, styleOptions } from "../cartoon";
import { makeCanvas } from "../imageIO";
import { adjust, hexToRgb, NEUTRAL_ADJUSTMENTS, type Pixels } from "../pixels";
import { drawCover } from "../text";
import type { StudioSpec } from "../studio";

// Picture Avatar: crop + position + a "look" + background + optional ring. Every look is a classic image treatment
// (colour adjustment, the cartoon effect, a duotone map or black & white) — no AI, nothing leaves the browser.
type Values = {
  shape: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  look: string;
  duoDark: string;
  duoLight: string;
  background: string;
  bg1: string;
  bg2: string;
  padding: number;
  ring: boolean;
  ringColour1: string;
  ringColour2: string;
  ringWidth: number;
  size: string;
};

/** Applies the chosen look to the photo pixels in place. Exported for tests. */
export function applyLook(px: Pixels, look: string, duoDark: string, duoLight: string): void {
  if (look === "professional") adjust(px, { ...NEUTRAL_ADJUSTMENTS, brightness: 6, contrast: 12, saturation: -12, warmth: 4 });
  else if (look === "mono") adjust(px, { ...NEUTRAL_ADJUSTMENTS, saturation: -100, contrast: 15 });
  else if (look === "cartoon") px.data.set(cartoon(px, styleOptions("cel", Math.min(px.width, px.height))).data);
  else if (look === "duotone") {
    const d = hexToRgb(duoDark);
    const l = hexToRgb(duoLight);
    for (let i = 0; i < px.data.length; i += 4) {
      const t = (0.299 * px.data[i] + 0.587 * px.data[i + 1] + 0.114 * px.data[i + 2]) / 255;
      px.data[i] = d.r + (l.r - d.r) * t;
      px.data[i + 1] = d.g + (l.g - d.g) * t;
      px.data[i + 2] = d.b + (l.b - d.b) * t;
    }
  }
}

function shapePath(ctx: CanvasRenderingContext2D, shape: string, x: number, y: number, s: number) {
  ctx.beginPath();
  if (shape === "circle") ctx.arc(x + s / 2, y + s / 2, s / 2, 0, Math.PI * 2);
  else if (shape === "rounded") {
    // Drawn by hand rather than ctx.roundRect, which older Safari and Firefox versions lack.
    const r = s * 0.22;
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + s, y, x + s, y + s, r);
    ctx.arcTo(x + s, y + s, x, y + s, r);
    ctx.arcTo(x, y + s, x, y, r);
    ctx.arcTo(x, y, x + s, y, r);
    ctx.closePath();
  } else ctx.rect(x, y, s, s);
}

function paint(ctx: CanvasRenderingContext2D, S: number, style: string, c1: string, c2: string): string | CanvasGradient {
  if (style !== "gradient") return c1;
  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  return g;
}

const spec: StudioSpec<Values> = {
  defaults: {
    shape: "circle",
    zoom: 100,
    offsetX: 0,
    offsetY: 0,
    look: "natural",
    duoDark: "#1e1b4b",
    duoLight: "#f9a8d4",
    background: "solid",
    bg1: "#eef2ff",
    bg2: "#fdf2f8",
    padding: 4,
    ring: false,
    ringColour1: "#4f46e5",
    ringColour2: "#ec4899",
    ringWidth: 4,
    size: "1024",
  },
  presets: [
    { label: "Professional", values: { shape: "circle", look: "professional", background: "solid", bg1: "#e9edf3", padding: 4, ring: false } },
    { label: "Cartoon", values: { shape: "circle", look: "cartoon", background: "gradient", bg1: "#fde68a", bg2: "#f9a8d4", padding: 4, ring: false } },
    { label: "Creative", values: { shape: "rounded", look: "duotone", duoDark: "#1e1b4b", duoLight: "#f9a8d4", background: "solid", bg1: "#1e1b4b", padding: 6, ring: false } },
    { label: "Social media", values: { shape: "circle", look: "natural", background: "transparent", padding: 0, ring: true, ringColour1: "#4f46e5", ringColour2: "#ec4899", ringWidth: 4 } },
  ],
  controls: (v) => [
    {
      type: "select",
      key: "shape",
      label: "Shape",
      options: [
        { value: "circle", label: "Circle" },
        { value: "rounded", label: "Rounded square" },
        { value: "square", label: "Square" },
      ],
    },
    { type: "range", key: "zoom", label: "Zoom", min: 100, max: 300, unit: "%" },
    { type: "range", key: "offsetX", label: "Move left / right", min: -50, max: 50 },
    { type: "range", key: "offsetY", label: "Move up / down", min: -50, max: 50 },
    {
      type: "select",
      key: "look",
      label: "Look",
      options: [
        { value: "natural", label: "Natural (unchanged colours)" },
        { value: "professional", label: "Professional (clean, slightly muted)" },
        { value: "cartoon", label: "Cartoon effect (flat colours, outlines)" },
        { value: "duotone", label: "Duotone (two colours)" },
        { value: "mono", label: "Black & white" },
      ],
    },
    ...(v.look === "duotone"
      ? [
          { type: "color" as const, key: "duoDark", label: "Duotone shadows" },
          { type: "color" as const, key: "duoLight", label: "Duotone highlights" },
        ]
      : []),
    {
      type: "select",
      key: "background",
      label: "Background",
      options: [
        { value: "transparent", label: "Transparent (PNG/WebP)" },
        { value: "solid", label: "Solid colour" },
        { value: "gradient", label: "Gradient" },
      ],
    },
    ...(v.background !== "transparent" ? [{ type: "color" as const, key: "bg1", label: v.background === "gradient" ? "Background start" : "Background colour" }] : []),
    ...(v.background === "gradient" ? [{ type: "color" as const, key: "bg2", label: "Background end" }] : []),
    { type: "range", key: "padding", label: "Space around the photo", min: 0, max: 15, step: 0.5, unit: "%" },
    { type: "toggle", key: "ring", label: "Add a ring around the photo" },
    ...(v.ring
      ? [
          { type: "color" as const, key: "ringColour1", label: "Ring start colour" },
          { type: "color" as const, key: "ringColour2", label: "Ring end colour" },
          { type: "range" as const, key: "ringWidth", label: "Ring thickness", min: 1, max: 10, step: 0.5, unit: "%" },
        ]
      : []),
    {
      type: "select",
      key: "size",
      label: "Output size",
      options: [
        { value: "256", label: "256 × 256 px" },
        { value: "512", label: "512 × 512 px" },
        { value: "1024", label: "1024 × 1024 px" },
      ],
    },
  ],
  formats: ["png", "webp", "jpeg"],
  fileSuffix: "avatar",
  showOriginal: true,
  render(source, v, { preview }) {
    const S = preview ? 512 : Number(v.size);
    const { canvas, ctx } = makeCanvas(S, S);
    if (v.background !== "transparent") {
      ctx.fillStyle = paint(ctx, S, v.background, v.bg1, v.bg2);
      ctx.fillRect(0, 0, S, S);
    }
    const pad = (S * v.padding) / 100;
    const outer = S - 2 * pad;
    const ringW = v.ring ? (S * v.ringWidth) / 100 : 0;
    if (v.ring) {
      ctx.fillStyle = paint(ctx, S, "gradient", v.ringColour1, v.ringColour2);
      shapePath(ctx, v.shape, pad, pad, outer);
      ctx.fill();
    }
    // The photo: cropped to a square with the chosen zoom/position, given its look, then clipped to the shape.
    const inner = Math.max(1, Math.round(outer - 2 * ringW));
    const photo = makeCanvas(inner, inner);
    drawCover(photo.ctx, source, 0, 0, inner, inner, v.zoom / 100, v.offsetX, v.offsetY);
    if (v.look !== "natural") {
      const img = photo.ctx.getImageData(0, 0, inner, inner);
      applyLook({ data: img.data, width: inner, height: inner }, v.look, v.duoDark, v.duoLight);
      photo.ctx.putImageData(img, 0, 0);
    }
    ctx.save();
    shapePath(ctx, v.shape, pad + ringW, pad + ringW, inner);
    ctx.clip();
    ctx.drawImage(photo.canvas, pad + ringW, pad + ringW);
    ctx.restore();
    return canvas;
  },
};

export default spec;
