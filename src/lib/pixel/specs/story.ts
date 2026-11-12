import { makeCanvas } from "../imageIO";
import { blurRegion } from "../pixels";
import { drawCover, drawTextBlock } from "../text";
import type { StudioSpec } from "../studio";
import { roundedRect } from "./borderFrame";

type Values = { background: string; colour1: string; colour2: string; photoSize: number; radius: number; heading: string; caption: string; textColour: string };

const W = 1080;
const H = 1920;
const font = (s: number) => `800 ${s}px "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
const captionFont = (s: number) => `600 ${s}px "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;

const spec: StudioSpec<Values> = {
  defaults: { background: "blur", colour1: "#4f46e5", colour2: "#ec4899", photoSize: 86, radius: 4, heading: "New post", caption: "Tap the link in bio", textColour: "#ffffff" },
  presets: [
    { label: "Blurred photo", values: { background: "blur", textColour: "#ffffff" } },
    { label: "Indigo → pink", values: { background: "gradient", colour1: "#4f46e5", colour2: "#ec4899", textColour: "#ffffff" } },
    { label: "Sunset", values: { background: "gradient", colour1: "#f97316", colour2: "#be123c", textColour: "#ffffff" } },
    { label: "Clean white", values: { background: "solid", colour1: "#ffffff", textColour: "#12142a" } },
    { label: "Black", values: { background: "solid", colour1: "#0b0b0f", textColour: "#ffffff" } },
  ],
  controls: (v) => [
    {
      type: "select",
      key: "background",
      label: "Background",
      options: [
        { value: "blur", label: "Blurred copy of the photo" },
        { value: "gradient", label: "Gradient" },
        { value: "solid", label: "Solid colour" },
      ],
    },
    ...(v.background !== "blur" ? [{ type: "color" as const, key: "colour1", label: v.background === "gradient" ? "Top colour" : "Background colour" }] : []),
    ...(v.background === "gradient" ? [{ type: "color" as const, key: "colour2", label: "Bottom colour" }] : []),
    { type: "range", key: "photoSize", label: "Photo width", min: 50, max: 100, unit: "% of the story width" },
    { type: "range", key: "radius", label: "Photo corner rounding", min: 0, max: 15, unit: "%" },
    { type: "text", key: "heading", label: "Heading (top)", maxLength: 80 },
    { type: "text", key: "caption", label: "Caption (bottom)", maxLength: 140 },
    { type: "color", key: "textColour", label: "Text colour" },
  ],
  formats: ["jpeg", "png"],
  fileSuffix: "story",
  render(source, v, { preview }) {
    // Preview at half size; the download is the full 1080 × 1920.
    const k = preview ? 0.5 : 1;
    const { canvas, ctx } = makeCanvas(W * k, H * k);
    const cw = canvas.width;
    const ch = canvas.height;

    if (v.background === "blur") {
      // Blur a small copy (fast) and scale it up; darken slightly so text stays readable.
      const small = makeCanvas(108, 192);
      drawCover(small.ctx, source, 0, 0, 108, 192);
      const img = small.ctx.getImageData(0, 0, 108, 192);
      blurRegion({ data: img.data, width: 108, height: 192 }, 0, 0, 108, 192, 6);
      small.ctx.putImageData(img, 0, 0);
      ctx.drawImage(small.canvas, 0, 0, cw, ch);
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.fillRect(0, 0, cw, ch);
    } else if (v.background === "gradient") {
      const g = ctx.createLinearGradient(0, 0, 0, ch);
      g.addColorStop(0, v.colour1);
      g.addColorStop(1, v.colour2);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);
    } else {
      ctx.fillStyle = v.colour1;
      ctx.fillRect(0, 0, cw, ch);
    }

    // Photo, fitted to the chosen width, centred between the heading and caption areas.
    const pw = (cw * v.photoSize) / 100;
    const ph = Math.min(ch * 0.62, (pw * source.height) / source.width);
    const px = (cw - pw) / 2;
    const py = ch * 0.19 + (ch * 0.62 - ph) / 2;
    ctx.save();
    roundedRect(ctx, px, py, pw, ph, (cw * v.radius) / 100);
    ctx.clip();
    drawCover(ctx, source, px, py, pw, ph);
    ctx.restore();

    const shadow = v.background === "solid" && v.textColour !== "#ffffff" ? undefined : "rgba(0,0,0,0.35)";
    drawTextBlock(ctx, v.heading, { x: cw / 2, y: ch * 0.105, anchor: "middle", maxWidth: cw * 0.86, maxHeight: ch * 0.13, maxSize: cw * 0.1, minSize: cw * 0.03, align: "center", font, fill: v.textColour, shadow });
    drawTextBlock(ctx, v.caption, { x: cw / 2, y: ch * 0.9, anchor: "middle", maxWidth: cw * 0.86, maxHeight: ch * 0.12, maxSize: cw * 0.06, minSize: cw * 0.025, align: "center", font: captionFont, fill: v.textColour, shadow });
    return canvas;
  },
};

export default spec;
