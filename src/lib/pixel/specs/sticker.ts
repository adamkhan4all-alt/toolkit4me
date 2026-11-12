import { makeCanvas } from "../imageIO";
import { cornerColour, removeColour } from "../pixels";
import { drawContain } from "../text";
import type { StudioSpec } from "../studio";

type Values = { removeBackground: boolean; tolerance: number; outline: number; outlineColour: string };

/** WhatsApp's sticker guidelines: 512 × 512 px, transparent background, a 16 px margin. */
export const STICKER_SIZE = 512;
export const STICKER_MARGIN = 16;

const spec: StudioSpec<Values> = {
  defaults: { removeBackground: true, tolerance: 15, outline: 3, outlineColour: "#ffffff" },
  controls: (v) => [
    {
      type: "toggle",
      key: "removeBackground",
      label: "Remove a plain background",
      help: "Makes the background colour (detected from the corners) transparent — best for pictures on a plain backdrop.",
    },
    ...(v.removeBackground ? [{ type: "range" as const, key: "tolerance", label: "Background tolerance", min: 0, max: 60, unit: "%" }] : []),
    { type: "range", key: "outline", label: "Sticker outline", min: 0, max: 6, step: 0.5, unit: "% (0 = none)" },
    { type: "color", key: "outlineColour", label: "Outline colour" },
  ],
  formats: ["webp", "png"],
  fileSuffix: "sticker",
  showOriginal: true,
  render(source, v, { preview }) {
    const S = preview ? STICKER_SIZE / 2 : STICKER_SIZE;
    const margin = (S * STICKER_MARGIN) / STICKER_SIZE;
    const ring = (S * v.outline) / 100;

    // 1. The picture, scaled to fit inside the margin and outline, with its background optionally removed.
    const inner = S - 2 * margin - 2 * ring;
    const art = makeCanvas(S, S);
    drawContain(art.ctx, source, margin + ring, margin + ring, inner, inner);
    if (v.removeBackground) {
      // Detect the background on the picture itself (not the transparent margin around it).
      const probe = makeCanvas(source.width, source.height);
      probe.ctx.drawImage(source, 0, 0);
      const probeImg = probe.ctx.getImageData(0, 0, source.width, source.height);
      const key = cornerColour({ data: probeImg.data, width: probeImg.width, height: probeImg.height });
      const img = art.ctx.getImageData(0, 0, S, S);
      removeColour({ data: img.data, width: S, height: S }, key, v.tolerance, 15, false);
      art.ctx.putImageData(img, 0, 0);
    }

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
    return canvas;
  },
};

export default spec;
