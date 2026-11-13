import { useEffect, useMemo, useRef, useState } from "react";
import type { ToolDefinition } from "../../../types/tool";
import { FileDropZone } from "../FileDropZone";
import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { LoadingState } from "../../ui/LoadingState";
import { downloadBlob } from "../../../lib/downloadBlob";
import { formatFileSize } from "../../../lib/format";
import { actualFormat, canvasToBlob, FORMAT_LABELS, ImageLoadError, loadImageFile, makeCanvas, outputName, scaledCopy, type OutputFormat } from "../../../lib/pixel/imageIO";
import { applyRegions, pointOnContainedCanvas, type Mode, type Region } from "../../../lib/pixel/regions";
import { PrivacyLine, inputClass, labelClass, panelClass } from "./shared";

const PREVIEW_SIDE = 1200;

export default function BlurAreasWorkspace({ tool }: { tool: ToolDefinition }) {
  const [source, setSource] = useState<HTMLCanvasElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [regions, setRegions] = useState<Region[]>([]);
  const [draft, setDraft] = useState<Region | null>(null);
  const [mode, setMode] = useState<Mode>("pixelate");
  const [strength, setStrength] = useState(6);
  const [format, setFormat] = useState<OutputFormat>("jpeg");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const preview = useMemo(() => (source ? scaledCopy(source, PREVIEW_SIDE) : null), [source]);

  useEffect(() => {
    const target = canvasRef.current;
    if (!preview || !target) return;
    target.width = preview.width;
    target.height = preview.height;
    const ctx = target.getContext("2d")!;
    ctx.drawImage(preview, 0, 0);
    applyRegions(target, regions, mode, strength);
    const outline = (r: Region, dashed: boolean) => {
      ctx.save();
      ctx.lineWidth = Math.max(2, target.width / 400);
      ctx.strokeStyle = "#ec4899";
      if (dashed) ctx.setLineDash([8, 6]);
      ctx.strokeRect(r.x * target.width, r.y * target.height, r.w * target.width, r.h * target.height);
      ctx.restore();
    };
    regions.forEach((r) => outline(r, false));
    if (draft) outline(draft, true);
  }, [preview, regions, draft, mode, strength]);

  // The canvas is object-contain, so tall images are letterboxed; map against the drawn image, not the element box.
  const point = (e: React.PointerEvent<HTMLCanvasElement>) =>
    pointOnContainedCanvas(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect(), e.currentTarget.width, e.currentTarget.height);
  const toRegion = (a: { x: number; y: number }, b: { x: number; y: number }): Region => ({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) });

  const onFiles = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setError(null);
    setDone(null);
    if (file.size > tool.maxFileSize * 1024 * 1024) {
      setError(`"${file.name}" is larger than ${tool.maxFileSize}MB.`);
      return;
    }
    setLoading(true);
    try {
      setSource(await loadImageFile(file));
      setFileName(file.name);
      setRegions([]);
    } catch (err) {
      setError(err instanceof ImageLoadError ? err.message : "This image couldn't be opened.");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!source) return;
    setBusy(true);
    setTimeout(async () => {
      try {
        const { canvas, ctx } = makeCanvas(source.width, source.height);
        ctx.drawImage(source, 0, 0);
        applyRegions(canvas, regions, mode, strength);
        const blob = await canvasToBlob(canvas, format, 0.92);
        const saved = actualFormat(blob, format);
        downloadBlob(blob, outputName(fileName, "blurred", saved.format));
        setDone(`${canvas.width} × ${canvas.height} px · ${FORMAT_LABELS[saved.format]} · ${formatFileSize(blob.size)}${saved.fellBack ? " (your browser saved PNG instead of WebP)" : ""}`);
      } catch {
        setError("The image couldn't be saved. Try a smaller photo.");
      } finally {
        setBusy(false);
      }
    }, 30);
  };

  if (!source) {
    return (
      <div className={panelClass}>
        <FileDropZone acceptedFormats={tool.acceptedFormats} acceptedMime={tool.acceptedMime} maxFileSizeMB={tool.maxFileSize} multiple={false} onFilesAdded={onFiles} />
        {loading && <LoadingState label="Opening image…" />}
        {error && <Alert variant="error">{error}</Alert>}
        <PrivacyLine>Your image is edited in your browser and never uploaded.</PrivacyLine>
      </div>
    );
  }

  return (
    <div className={panelClass}>
      <p className="text-sm text-neutral-700">
        <strong>Drag over each face, number plate or piece of text</strong> you want to hide. Add as many boxes as you need.
      </p>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Your image with ${regions.length} hidden area${regions.length === 1 ? "" : "s"}`}
        className="h-auto max-h-[520px] w-full cursor-crosshair touch-none rounded-lg border border-neutral-200 object-contain"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          start.current = point(e);
          setDraft(null);
        }}
        onPointerMove={(e) => start.current && setDraft(toRegion(start.current, point(e)))}
        onPointerUp={(e) => {
          if (!start.current) return;
          const r = toRegion(start.current, point(e));
          start.current = null;
          setDraft(null);
          if (r.w > 0.01 && r.h > 0.01) setRegions((rs) => [...rs, r]);
        }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="blur-mode" className={labelClass}>
            Effect
          </label>
          <select id="blur-mode" value={mode} onChange={(e) => setMode(e.target.value as Mode)} className={inputClass}>
            <option value="pixelate">Pixelate</option>
            <option value="blur">Blur</option>
            <option value="box">Solid black box</option>
          </select>
        </div>
        {mode !== "box" && (
          <div>
            <label htmlFor="blur-strength" className={`${labelClass} flex justify-between`}>
              <span>Strength</span>
              <span className="font-normal text-neutral-600">{strength}</span>
            </label>
            <input id="blur-strength" type="range" min={1} max={10} value={strength} onChange={(e) => setStrength(Number(e.target.value))} className="w-full accent-[var(--color-brand-600)]" />
          </div>
        )}
        <div>
          <label htmlFor="blur-format" className={labelClass}>
            Download format
          </label>
          <select id="blur-format" value={format} onChange={(e) => setFormat(e.target.value as OutputFormat)} className={inputClass}>
            <option value="jpeg">JPG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
      </div>

      {mode === "blur" && (
        <Alert variant="warning">A light blur can sometimes be partly reversed. For anything truly sensitive, use Pixelate at a high strength or a solid box.</Alert>
      )}
      {error && <Alert variant="error">{error}</Alert>}
      {done && <Alert variant="success">Downloaded: {done}</Alert>}

      <div className="flex flex-wrap gap-2">
        <Button onClick={download} disabled={busy || regions.length === 0}>
          {busy ? "Preparing…" : `Download ${FORMAT_LABELS[format]}`}
        </Button>
        <Button variant="secondary" disabled={regions.length === 0} onClick={() => setRegions((rs) => rs.slice(0, -1))}>
          Undo last box
        </Button>
        <Button variant="secondary" disabled={regions.length === 0} onClick={() => setRegions([])}>
          Clear all
        </Button>
        <Button variant="secondary" onClick={() => setSource(null)}>
          Choose another image
        </Button>
      </div>
      <p className="text-xs text-neutral-600">
        {regions.length === 0 ? "No areas hidden yet." : `${regions.length} area${regions.length === 1 ? "" : "s"} hidden.`} The downloaded copy is a new image; your original file isn't changed.
      </p>
      <PrivacyLine>Your image is edited in your browser and never uploaded.</PrivacyLine>
    </div>
  );
}
