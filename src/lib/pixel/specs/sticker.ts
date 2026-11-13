import { makeCanvas } from "../imageIO";
import { cornerColour, removeColour } from "../pixels";
import { drawContain, drawCover, drawTextBlock } from "../text";
import type { StudioSpec } from "../studio";

type Values = {
  framing: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  removeBackground: boolean;
  removeMode: string;
  tolerance: number;
  outline: number;
  outlineColour: string;
  text: string;
  textPosition: string;
  textSize: number;
  textColour: string;
  textOutline: string;
};

/** WhatsApp's sticker guidelines: 512 × 512 px, transparent background, a 16 px margin. */
export const STICKER_SIZE = 512;
export const STICKER_MARGIN = 16;

const STICKER_FONT = (size: number) => `900 ${size}px "Arial Black", "Segoe UI", Impact, sans-serif`;

const spec: StudioSpec<Values> = {
  defaults: {
    framing: "fit",
    zoom: 130,
    offsetX: 0,
    offsetY: 0,
    removeBackground: true,
    removeMode: "around",
    tolerance: 15,
    outline: 3,
    outlineColour: "#ffffff",
    text: "",
    textPosition: "bottom",
    textSize: 16,
    textColour: "#ffffff",
    textOutline: "#111111",
  },
  controls: (v) => [
    {
      type: "select",
      key: "framing",
      label: "Framing",
      options: [
        { value: "fit", label: "Whole picture" },
        { value: "crop", label: "Crop: zoom and move" },
      ],
    },
    ...(v.framing === "crop"
      ? [
          { type: "range" as const, key: "zoom", label: "Zoom", min: 100, max: 400, unit: "%" },
          { type: "range" as const, key: "offsetX", label: "Move left / right", min: -50, max: 50 },
          { type: "range" as const, key: "offsetY", label: "Move up / down", min: -50, max: 50 },
        ]
      : []),
    {
      type: "toggle",
      key: "removeBackground",
      label: "Remove a plain background",
      help: "Makes the background colour (detected from the corners) transparent — best for pictures on a plain backdrop.",
    },
    ...(v.removeBackground
      ? [
          {
            type: "select" as const,
            key: "removeMode",
            label: "Remove",
            options: [
              { value: "around", label: "Background around the subject (recommended)" },
              { value: "everywhere", label: "That colour everywhere (logos with holes)" },
            ],
          },
          { type: "range" as const, key: "tolerance", label: "Background tolerance", min: 0, max: 60, unit: "%" },
        ]
      : []),
    { type: "range", key: "outline", label: "Sticker outline", min: 0, max: 6, step: 0.5, unit: "% (0 = none)" },
    { type: "color", key: "outlineColour", label: "Outline colour" },
    { type: "text", key: "text", label: "Caption (optional)", placeholder: "e.g. LOL, Thank you!, On my way", maxLength: 40 },
    ...(v.text.trim()
      ? [
          {
            type: "select" as const,
            key: "textPosition",
            label: "Caption position",
            options: [
              { value: "bottom", label: "Bottom" },
              { value: "top", label: "Top" },
            ],
          },
          { type: "range" as const, key: "textSize", label: "Caption size", min: 8, max: 26, unit: "% of the sticker" },
          { type: "color" as const, key: "textColour", label: "Caption colour" },
          { type: "color" as const, key: "textOutline", label: "Caption outline" },
        ]
      : []),
  ],
  formats: ["webp", "png"],
  fileSuffix: "sticker",
  showOriginal: true,
  render(source, v, { preview }) {
    const S = preview ? STICKER_SIZE / 2 : STICKER_SIZE;
    const margin = (S * STICKER_MARGIN) / STICKER_SIZE;
    const ring = (S * v.outline) / 100;

    // 1. The picture inside the margin and outline: the whole picture, or a square crop with zoom and position.
    const inner = S - 2 * margin - 2 * ring;
    // Background removal runs on the picture itself, before it's placed: its corners give the background colour,
    // and "around the subject" floods inward from the picture's own edges, so matching colours inside the subject
    // (white fur, a white shirt) aren't punched out.
    let picture: HTMLCanvasElement = source;
    if (v.removeBackground) {
      const probe = makeCanvas(source.width, source.height);
      probe.ctx.drawImage(source, 0, 0);
      const img = probe.ctx.getImageData(0, 0, source.width, source.height);
      const px = { data: img.data, width: img.width, height: img.height };
      removeColour(px, cornerColour(px), v.tolerance, 15, v.removeMode !== "everywhere");
      probe.ctx.putImageData(img, 0, 0);
      picture = probe.canvas;
    }
    const art = makeCanvas(S, S);
    if (v.framing === "crop") drawCover(art.ctx, picture, margin + ring, margin + ring, inner, inner, v.zoom / 100, v.offsetX, v.offsetY);
    else drawContain(art.ctx, picture, margin + ring, margin + ring, inner, inner);

    const { canvas, ctx } = makeCanvas(S, S);
    // 2. Outline: stamp the picture's silhouette around a circle of offsets, then colour it in.
    if (ring > 0) {
      const outline = makeCanvas(S, S);
      const steps = 24;
      for (let i = 0; i < steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        outline.ctx.drawImage(art.canvas, Math.cos(a) * ring, Math.sin(a) * ring);
      }
      outline.ctx.globalCompositeOperation = "source-in";
      outline.ctx.fillStyle = v.outlineColour;
      outline.ctx.fillRect(0, 0, S, S);
      ctx.drawImage(outline.canvas, 0, 0);
    }
    ctx.drawImage(art.canvas, 0, 0);

    // 3. Caption, kept inside WhatsApp's 16 px margin, with a thick outline so it reads on any chat background.
    const caption = v.text.trim();
    if (caption) {
      const top = v.textPosition === "top";
      drawTextBlock(ctx, caption, {
        x: S / 2,
        y: top ? margin : S - margin,
        anchor: top ? "top" : "bottom",
        maxWidth: S - 2 * margin,
        maxHeight: S * 0.4,
        maxSize: (S * v.textSize) / 100,
        minSize: Math.max(8, S * 0.04),
        align: "center",
        font: STICKER_FONT,
        fill: v.textColour,
        stroke: v.textOutline,
        strokeRatio: 0.22,
        lineHeight: 1.05,
      });
    }
    return canvas;
  },
};

export default spec;
