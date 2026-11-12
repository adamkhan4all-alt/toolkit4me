import { makeCanvas } from "../imageIO";
import { drawCover, drawTextBlock } from "../text";
import type { StudioSpec } from "../studio";

type Values = { headline: string; position: string; textColour: string; outline: string; overlay: number; badge: string; badgeColour: string; zoom: number; offsetX: number; offsetY: number };

const W = 1280;
const H = 720;
const font = (s: number) => `900 ${s}px "Arial Black", "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;

const spec: StudioSpec<Values> = {
  defaults: { headline: "I tried every PDF trick", position: "left", textColour: "#ffffff", outline: "#000000", overlay: 55, badge: "", badgeColour: "#dc2626", zoom: 100, offsetX: 0, offsetY: 0 },
  presets: [
    { label: "White on dark", values: { textColour: "#ffffff", outline: "#000000", overlay: 55 } },
    { label: "Yellow pop", values: { textColour: "#facc15", outline: "#000000", overlay: 45 } },
    { label: "Clean (no overlay)", values: { textColour: "#ffffff", outline: "#000000", overlay: 0 } },
  ],
  controls: [
    { type: "text", key: "headline", label: "Headline (keep it short — 3 to 6 words reads best)", maxLength: 70 },
    {
      type: "select",
      key: "position",
      label: "Text position",
      options: [
        { value: "left", label: "Left side" },
        { value: "right", label: "Right side" },
        { value: "bottom", label: "Across the bottom" },
      ],
    },
    { type: "color", key: "textColour", label: "Text colour" },
    { type: "color", key: "outline", label: "Outline colour" },
    { type: "range", key: "overlay", label: "Dark overlay behind the text", min: 0, max: 90, unit: "%" },
    { type: "text", key: "badge", label: "Badge (optional, e.g. NEW or PART 2)", maxLength: 16 },
    { type: "color", key: "badgeColour", label: "Badge colour" },
    { type: "range", key: "zoom", label: "Photo zoom", min: 100, max: 250, unit: "%" },
    { type: "range", key: "offsetX", label: "Move photo left / right", min: -50, max: 50 },
    { type: "range", key: "offsetY", label: "Move photo up / down", min: -50, max: 50 },
  ],
  formats: ["jpeg", "png"],
  fileSuffix: "thumbnail",
  render(source, v, { preview }) {
    const k = preview ? 0.5 : 1;
    const { canvas, ctx } = makeCanvas(W * k, H * k);
    const cw = canvas.width;
    const ch = canvas.height;
    drawCover(ctx, source, 0, 0, cw, ch, v.zoom / 100, v.offsetX, v.offsetY);

    if (v.overlay > 0) {
      const a = v.overlay / 100;
      const g =
        v.position === "left" ? ctx.createLinearGradient(0, 0, cw, 0) : v.position === "right" ? ctx.createLinearGradient(cw, 0, 0, 0) : ctx.createLinearGradient(0, ch, 0, 0);
      g.addColorStop(0, `rgba(0,0,0,${a})`);
      g.addColorStop(0.6, `rgba(0,0,0,${a * 0.35})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);
    }

    const pad = cw * 0.05;
    const area =
      v.position === "bottom"
        ? { x: cw / 2, y: ch - pad, w: cw - 2 * pad, h: ch * 0.38, align: "center" as const, anchor: "bottom" as const }
        : { x: v.position === "left" ? pad : cw - pad, y: ch / 2, w: cw * 0.55, h: ch * 0.75, align: (v.position === "left" ? "left" : "right") as CanvasTextAlign, anchor: "middle" as const };
    drawTextBlock(ctx, v.headline.toUpperCase(), {
      x: area.x,
      y: area.y,
      maxWidth: area.w,
      maxHeight: area.h,
      maxSize: ch * 0.2,
      minSize: ch * 0.06,
      align: area.align,
      anchor: area.anchor,
      font,
      fill: v.textColour,
      stroke: v.outline,
      strokeRatio: 0.16,
      lineHeight: 1.02,
    });

    if (v.badge.trim()) {
      const size = ch * 0.075;
      ctx.font = font(size);
      const text = v.badge.trim().toUpperCase();
      const bw = ctx.measureText(text).width + size * 0.9;
      const bh = size * 1.5;
      const bx = v.position === "right" ? pad * 0.6 : cw - pad * 0.6 - bw;
      const by = pad * 0.6;
      ctx.fillStyle = v.badgeColour;
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(text, bx + bw / 2, by + bh / 2 + size * 0.04);
    }
    return canvas;
  },
};

export default spec;
