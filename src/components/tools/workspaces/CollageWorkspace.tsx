import { useEffect, useRef, useState } from "react";
import type { ToolDefinition } from "../../../types/tool";
import { FileDropZone } from "../FileDropZone";
import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { LoadingState } from "../../ui/LoadingState";
import { downloadBlob } from "../../../lib/downloadBlob";
import { formatFileSize } from "../../../lib/format";
import { canvasToBlob, FORMAT_LABELS, ImageLoadError, loadImageFile, makeCanvas, type OutputFormat } from "../../../lib/pixel/imageIO";
import { COLLAGE_LAYOUTS, COLLAGE_SIZES, defaultLayoutFor, layoutCells } from "../../../lib/pixel/collage";
import { drawCover } from "../../../lib/pixel/text";
import { roundedRect } from "../../../lib/pixel/specs/borderFrame";
import { PrivacyLine, inputClass, labelClass, panelClass } from "./shared";

const MAX_PHOTOS = 9;
/** Photos are kept at up to 2048 px — enough for any cell in a 1920 px collage, and gentle on phone memory. */
const PHOTO_SIDE = 2048;

interface Photo {
  id: number;
  name: string;
  canvas: HTMLCanvasElement;
}

interface Settings {
  layoutId: string;
  sizeId: string;
  gap: number;
  radius: number;
  background: string;
}

/** Draws the collage at `scale` (1 = full size) and returns the canvas. */
function renderCollage(photos: Photo[], s: Settings, scale: number): HTMLCanvasElement {
  const size = COLLAGE_SIZES.find((z) => z.id === s.sizeId) ?? COLLAGE_SIZES[0];
  const layout = COLLAGE_LAYOUTS.find((l) => l.id === s.layoutId) ?? COLLAGE_LAYOUTS[0];
  const { canvas, ctx } = makeCanvas(size.width * scale, size.height * scale);
  ctx.fillStyle = s.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const gap = Math.round((Math.min(canvas.width, canvas.height) * s.gap) / 100);
  const radius = (Math.min(canvas.width, canvas.height) * s.radius) / 100;
  layoutCells(layout, canvas.width, canvas.height, gap).forEach((cell, i) => {
    const photo = photos[i];
    ctx.save();
    roundedRect(ctx, cell.x, cell.y, cell.w, cell.h, radius);
    ctx.clip();
    if (photo) drawCover(ctx, photo.canvas, cell.x, cell.y, cell.w, cell.h);
    else {
      ctx.fillStyle = "rgba(127,127,127,0.18)";
      ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
    }
    ctx.restore();
  });
  return canvas;
}

let nextId = 1;

export default function CollageWorkspace({ tool }: { tool: ToolDefinition }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [settings, setSettings] = useState<Settings>({ layoutId: "2x2", sizeId: "square", gap: 1.5, radius: 0, background: "#ffffff" });
  const [format, setFormat] = useState<OutputFormat>("jpeg");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const layout = COLLAGE_LAYOUTS.find((l) => l.id === settings.layoutId) ?? COLLAGE_LAYOUTS[0];

  useEffect(() => {
    const target = previewRef.current;
    if (!target || photos.length === 0) return;
    const frame = requestAnimationFrame(() => {
      const out = renderCollage(photos, settings, 0.5);
      target.width = out.width;
      target.height = out.height;
      target.getContext("2d")!.drawImage(out, 0, 0);
    });
    return () => cancelAnimationFrame(frame);
  }, [photos, settings]);

  const addFiles = async (files: File[]) => {
    setError(null);
    setDone(null);
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) {
      setError(`A collage can have up to ${MAX_PHOTOS} photos. Remove one to add another.`);
      return;
    }
    const tooBig = files.find((f) => f.size > tool.maxFileSize * 1024 * 1024);
    if (tooBig) {
      setError(`"${tooBig.name}" is larger than ${tool.maxFileSize}MB.`);
      return;
    }
    setLoading(true);
    const added: Photo[] = [];
    try {
      for (const file of files.slice(0, room)) added.push({ id: nextId++, name: file.name, canvas: await loadImageFile(file, PHOTO_SIDE) });
    } catch (err) {
      setError(err instanceof ImageLoadError ? err.message : "One of the images couldn't be opened.");
    }
    if (files.length > room) setError(`Only the first ${room} photo${room === 1 ? "" : "s"} were added — a collage can have up to ${MAX_PHOTOS}.`);
    setLoading(false);
    if (added.length) {
      const all = [...photos, ...added];
      setPhotos(all);
      // Switch to a layout that fits the new number of photos, unless the current one already does.
      if (layout.photos !== all.length) setSettings((s) => ({ ...s, layoutId: defaultLayoutFor(all.length).id }));
    }
  };

  const move = (index: number, dir: -1 | 1) =>
    setPhotos((ps) => {
      const next = [...ps];
      const j = index + dir;
      if (j < 0 || j >= next.length) return ps;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });

  const download = () => {
    setBusy(true);
    setTimeout(async () => {
      try {
        const out = renderCollage(photos, settings, 1);
        const blob = await canvasToBlob(out, format, 0.92);
        const ext = blob.type === "image/jpeg" ? "jpg" : blob.type.replace("image/", "");
        downloadBlob(blob, `collage.${ext}`);
        setDone(`${out.width} × ${out.height} px · ${ext.toUpperCase()} · ${formatFileSize(blob.size)}`);
      } catch {
        setError("The collage couldn't be saved. Try fewer or smaller photos.");
      } finally {
        setBusy(false);
      }
    }, 30);
  };

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings((s) => ({ ...s, [key]: value }));

  return (
    <div className={panelClass}>
      {photos.length > 0 && <canvas ref={previewRef} className="mx-auto h-auto max-h-[520px] w-auto max-w-full rounded-lg border border-neutral-200" role="img" aria-label="Collage preview" />}

      {photos.length < MAX_PHOTOS && (
        <FileDropZone acceptedFormats={tool.acceptedFormats} acceptedMime={tool.acceptedMime} maxFileSizeMB={tool.maxFileSize} multiple onFilesAdded={addFiles} />
      )}
      {loading && <LoadingState label="Opening photos…" />}
      {error && <Alert variant="error">{error}</Alert>}

      {photos.length > 0 && (
        <>
          <ol className="flex flex-col gap-1.5" aria-label="Photos, in collage order">
            {photos.map((p, i) => (
              <li key={p.id} className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
                <span className="w-5 text-xs font-semibold text-neutral-600">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-neutral-900">{p.name}</span>
                <button type="button" className="focus-ring rounded px-2 py-1 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${p.name} earlier`}>
                  ↑
                </button>
                <button type="button" className="focus-ring rounded px-2 py-1 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40" disabled={i === photos.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${p.name} later`}>
                  ↓
                </button>
                <button type="button" className="focus-ring rounded px-2 py-1 text-error-600 hover:bg-error-50" onClick={() => setPhotos((ps) => ps.filter((x) => x.id !== p.id))} aria-label={`Remove ${p.name}`}>
                  ✕
                </button>
              </li>
            ))}
          </ol>
          {photos.length < layout.photos && (
            <p className="text-xs text-neutral-600">
              This layout has {layout.photos} spaces — add {layout.photos - photos.length} more photo{layout.photos - photos.length === 1 ? "" : "s"}, or choose a smaller layout.
            </p>
          )}
          {photos.length > layout.photos && <p className="text-xs text-neutral-600">This layout shows the first {layout.photos} photos. Reorder them, or choose a larger layout.</p>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="collage-layout" className={labelClass}>
                Layout
              </label>
              <select id="collage-layout" value={settings.layoutId} onChange={(e) => set("layoutId", e.target.value)} className={inputClass}>
                {COLLAGE_LAYOUTS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="collage-size" className={labelClass}>
                Size
              </label>
              <select id="collage-size" value={settings.sizeId} onChange={(e) => set("sizeId", e.target.value)} className={inputClass}>
                {COLLAGE_SIZES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="collage-gap" className={`${labelClass} flex justify-between`}>
                <span>Spacing</span>
                <span className="font-normal text-neutral-600">{settings.gap}%</span>
              </label>
              <input id="collage-gap" type="range" min={0} max={5} step={0.5} value={settings.gap} onChange={(e) => set("gap", Number(e.target.value))} className="w-full accent-[var(--color-brand-600)]" />
            </div>
            <div>
              <label htmlFor="collage-radius" className={`${labelClass} flex justify-between`}>
                <span>Corner rounding</span>
                <span className="font-normal text-neutral-600">{settings.radius}%</span>
              </label>
              <input id="collage-radius" type="range" min={0} max={8} step={0.5} value={settings.radius} onChange={(e) => set("radius", Number(e.target.value))} className="w-full accent-[var(--color-brand-600)]" />
            </div>
            <div>
              <label htmlFor="collage-bg" className={labelClass}>
                Background colour
              </label>
              <input id="collage-bg" type="color" value={settings.background} onChange={(e) => set("background", e.target.value)} className="h-11 w-16 cursor-pointer rounded-[var(--radius-control)] border border-neutral-200 bg-white p-1" />
            </div>
            <div>
              <label htmlFor="collage-format" className={labelClass}>
                Download format
              </label>
              <select id="collage-format" value={format} onChange={(e) => setFormat(e.target.value as OutputFormat)} className={inputClass}>
                <option value="jpeg">JPG — smallest</option>
                <option value="png">PNG</option>
              </select>
            </div>
          </div>

          {done && <Alert variant="success">Downloaded: {done}</Alert>}
          <div className="flex flex-wrap gap-2">
            <Button onClick={download} disabled={busy}>
              {busy ? "Preparing…" : `Download ${FORMAT_LABELS[format]}`}
            </Button>
            <Button variant="secondary" onClick={() => setPhotos([])}>
              Start again
            </Button>
          </div>
        </>
      )}
      <PrivacyLine>Your photos are combined in your browser and never uploaded.</PrivacyLine>
    </div>
  );
}
