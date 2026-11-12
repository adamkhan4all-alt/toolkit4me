import { makeCanvas } from "../imageIO";
import { drawTextBlock } from "../text";
import type { StudioSpec } from "../studio";

type Values = { top: string; bottom: string; size: number; uppercase: boolean; colour: string; outline: string; font: string };

/** System fonts only (no download): Impact on Windows/macOS, with bold sans-serif fallbacks elsewhere. */
export const FONTS: Record<string, (size: number) => string> = {
  impact: (s) => `${s}px Impact, "Haettenschweiler", "Arial Narrow Bold", "Arial Black", sans-serif`,
  bold: (s) => `800 ${s}px "Arial Black", "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
  rounded: (s) => `700 ${s}px "Trebuchet MS", "Segoe UI", Roboto, sans-serif`,
};

const spec: StudioSpec<Values> = {
  defaults: { top: "When the file finally compresses", bottom: "On the first try", size: 11, uppercase: true, colour: "#ffffff", outline: "#000000", font: "impact" },
  controls: [
    { type: "text", key: "top", label: "Top text", placeholder: "Top text", maxLength: 120 },
    { type: "text", key: "bottom", label: "Bottom text", placeholder: "Bottom text", maxLength: 120 },
    { type: "range", key: "size", label: "Maximum text size", min: 5, max: 20, unit: "% of the image width" },
    {
      type: "select",
      key: "font",
      label: "Font",
      options: [
        { value: "impact", label: "Classic meme (Impact)" },
        { value: "bold", label: "Heavy sans-serif" },
        { value: "rounded", label: "Friendly sans-serif" },
      ],
    },
    { type: "color", key: "colour", label: "Text colour" },
    { type: "color", key: "outline", label: "Outline colour" },
    { type: "toggle", key: "uppercase", label: "ALL CAPS" },
  ],
  formats: ["jpeg", "png", "webp"],
  fileSuffix: "meme",
  render(source, v) {
    const { canvas, ctx } = makeCanvas(source.width, source.height);
    ctx.drawImage(source, 0, 0);
    const W = canvas.width;
    const H = canvas.height;
    const style = {
      x: W / 2,
      maxWidth: W * 0.92,
      maxHeight: H * 0.3,
      maxSize: (W * v.size) / 100,
      minSize: Math.max(8, W * 0.025),
      align: "center" as const,
      font: FONTS[v.font] ?? FONTS.impact,
      fill: v.colour,
      stroke: v.outline,
      strokeRatio: 0.14,
      lineHeight: 1.05,
      letterSpacing: 0.03,
    };
    const fmt = (t: string) => (v.uppercase ? t.toUpperCase() : t);
    drawTextBlock(ctx, fmt(v.top), { ...style, y: H * 0.03, anchor: "top" });
    drawTextBlock(ctx, fmt(v.bottom), { ...style, y: H * 0.97, anchor: "bottom" });
    return canvas;
  },
};

export default spec;
