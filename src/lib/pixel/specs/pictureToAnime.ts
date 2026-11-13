import { CARTOON_STYLES, cartoon, styleOptions, type CartoonStyle } from "../cartoon";
import { makeCanvas } from "../imageIO";
import { shorterSide, type StudioSpec } from "../studio";

// Anime-style cartoon effect (flat colours + ink outlines). Classic image processing, not AI — see ../cartoon.ts.
type Values = { style: string; levels: number; lines: number; thickness: number; smoothing: number };

const STYLE_IDS = Object.keys(CARTOON_STYLES) as CartoonStyle[];

const spec: StudioSpec<Values> = {
  defaults: { style: "cel", levels: 5, lines: 50, thickness: 100, smoothing: 100 },
  presets: [
    { label: "Cel-shaded", values: { style: "cel", levels: 5, lines: 50, thickness: 100, smoothing: 100 } },
    { label: "Soft pastel", values: { style: "soft", levels: 7, lines: 45, thickness: 80, smoothing: 100 } },
    { label: "Bold comic", values: { style: "bold", levels: 4, lines: 65, thickness: 130, smoothing: 90 } },
    { label: "Manga ink", values: { style: "manga", levels: 3, lines: 60, thickness: 100, smoothing: 100 } },
  ],
  controls: [
    { type: "select", key: "style", label: "Look", options: STYLE_IDS.map((id) => ({ value: id, label: CARTOON_STYLES[id].label })) },
    { type: "range", key: "levels", label: "Colour bands (fewer = flatter)", min: 2, max: 10 },
    { type: "range", key: "lines", label: "Outline detail (0 = no outlines)", min: 0, max: 100, unit: "%" },
    { type: "range", key: "thickness", label: "Outline thickness", min: 50, max: 200, unit: "%" },
    { type: "range", key: "smoothing", label: "Smoothing", min: 0, max: 200, unit: "%" },
  ],
  formats: ["png", "jpeg", "webp"],
  fileSuffix: "anime-style",
  showOriginal: true,
  render(source, v) {
    const { canvas, ctx } = makeCanvas(source.width, source.height);
    ctx.drawImage(source, 0, 0);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const style = (STYLE_IDS as string[]).includes(v.style) ? (v.style as CartoonStyle) : "cel";
    const base = CARTOON_STYLES[style];
    // Sizes are percentages of the shorter side, so the preview and the full-size download look the same.
    const options = styleOptions(style, shorterSide(source), {
      levels: v.levels,
      lineStrength: v.lines,
      lineWidthPct: (base.line * v.thickness) / 100,
      smoothPct: (base.smooth * v.smoothing) / 100,
    });
    const out = cartoon({ data: img.data, width: img.width, height: img.height }, options);
    img.data.set(out.data);
    ctx.putImageData(img, 0, 0);
    return canvas;
  },
};

export default spec;
