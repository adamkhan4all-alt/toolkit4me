import { makeCanvas } from "../imageIO";
import { cornerColour, removeColour } from "../pixels";
import { drawCover } from "../text";
import type { StudioSpec } from "../studio";

/**
 * Common photo sizes. Head height is measured from chin to the top of the
 * hair. Rules change and differ by application type, so the tool page
 * tells people to check the official requirements before printing.
 */
export const PASSPORT_PRESETS = [
  { id: "us", label: "US passport/visa — 2 × 2 in (51 × 51 mm)", widthMm: 51, heightMm: 51, headMin: 25, headMax: 35 },
  { id: "uk", label: "UK passport — 35 × 45 mm", widthMm: 35, heightMm: 45, headMin: 29, headMax: 34 },
  { id: "schengen", label: "Schengen visa / EU — 35 × 45 mm", widthMm: 35, heightMm: 45, headMin: 32, headMax: 36 },
  { id: "australia", label: "Australia passport — 35 × 45 mm", widthMm: 35, heightMm: 45, headMin: 32, headMax: 36 },
  { id: "canada", label: "Canada passport — 50 × 70 mm", widthMm: 50, heightMm: 70, headMin: 31, headMax: 36 },
] as const;

const DPI = 300;
export const mmToPx = (mm: number) => Math.round((mm / 25.4) * DPI);
/** 4 × 6 inch (10 × 15 cm) photo paper, landscape, at 300 DPI. */
const SHEET = { width: mmToPx(152.4), height: mmToPx(101.6) };

type Values = { preset: string; zoom: number; offsetX: number; offsetY: number; whiten: boolean; tolerance: number; output: string; guides: boolean };

/** How many photos of a size fit on the print sheet, with 2 mm gaps. */
export function sheetGrid(w: number, h: number): { cols: number; rows: number; gap: number } {
  const gap = mmToPx(2);
  return { cols: Math.max(1, Math.floor((SHEET.width - gap) / (w + gap))), rows: Math.max(1, Math.floor((SHEET.height - gap) / (h + gap))), gap };
}

const spec: StudioSpec<Values> = {
  defaults: { preset: "uk", zoom: 100, offsetX: 0, offsetY: 0, whiten: false, tolerance: 18, output: "single", guides: true },
  controls: (v) => [
    { type: "select", key: "preset", label: "Photo size", options: PASSPORT_PRESETS.map((p) => ({ value: p.id, label: p.label })) },
    { type: "range", key: "zoom", label: "Zoom", min: 100, max: 300, unit: "%" },
    { type: "range", key: "offsetX", label: "Move left / right", min: -50, max: 50 },
    { type: "range", key: "offsetY", label: "Move up / down", min: -50, max: 50 },
    { type: "toggle", key: "guides", label: "Show head-size guides in the preview", help: "The download never includes the guides." },
    {
      type: "toggle",
      key: "whiten",
      label: "Make a plain background white",
      help: "Replaces a plain, evenly lit background colour with white. Check the edges of hair carefully — retake the photo against a white wall if they look wrong.",
    },
    ...(v.whiten ? [{ type: "range" as const, key: "tolerance", label: "Background tolerance", min: 5, max: 50, unit: "%" }] : []),
    {
      type: "select",
      key: "output",
      label: "Download",
      options: [
        { value: "single", label: "One photo at 300 DPI" },
        { value: "sheet", label: "4 × 6 in (10 × 15 cm) print sheet with several copies" },
      ],
    },
  ],
  formats: ["jpeg", "png"],
  fileSuffix: "passport-photo",
  showOriginal: true,
  render(source, v, { preview }) {
    const p = PASSPORT_PRESETS.find((x) => x.id === v.preset) ?? PASSPORT_PRESETS[1];
    const w = mmToPx(p.widthMm);
    const h = mmToPx(p.heightMm);

    const photo = makeCanvas(w, h);
    drawCover(photo.ctx, source, 0, 0, w, h, v.zoom / 100, v.offsetX, v.offsetY);
    if (v.whiten) {
      const img = photo.ctx.getImageData(0, 0, w, h);
      const px = { data: img.data, width: w, height: h };
      removeColour(px, cornerColour(px), v.tolerance, 25, true);
      photo.ctx.putImageData(img, 0, 0);
      const white = makeCanvas(w, h);
      white.ctx.fillStyle = "#ffffff";
      white.ctx.fillRect(0, 0, w, h);
      white.ctx.drawImage(photo.canvas, 0, 0);
      photo.ctx.clearRect(0, 0, w, h);
      photo.ctx.drawImage(white.canvas, 0, 0);
    }

    if (preview && v.guides) {
      // Two dashed bands: where the top of the head and the chin should fall for the allowed head heights.
      const ctx = photo.ctx;
      const scale = h / p.heightMm;
      const crownTop = h * 0.08;
      ctx.save();
      ctx.setLineDash([w * 0.03, w * 0.02]);
      ctx.lineWidth = Math.max(2, w * 0.006);
      ctx.strokeStyle = "rgba(236, 72, 153, 0.9)";
      for (const y of [crownTop, crownTop + p.headMin * scale, crownTop + p.headMax * scale]) {
        ctx.beginPath();
        ctx.moveTo(w * 0.15, y);
        ctx.lineTo(w * 0.85, y);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.strokeStyle = "rgba(79, 70, 229, 0.6)";
      ctx.stroke();
      ctx.restore();
    }

    if (v.output !== "sheet" || preview) return photo.canvas;

    const { cols, rows, gap } = sheetGrid(w, h);
    const { canvas, ctx } = makeCanvas(SHEET.width, SHEET.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const ox = (canvas.width - (cols * w + (cols - 1) * gap)) / 2;
    const oy = (canvas.height - (rows * h + (rows - 1) * gap)) / 2;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const x = ox + c * (w + gap);
        const y = oy + r * (h + gap);
        ctx.drawImage(photo.canvas, x, y);
        ctx.strokeStyle = "#cfd4e0";
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);
      }
    return canvas;
  },
};

export default spec;
