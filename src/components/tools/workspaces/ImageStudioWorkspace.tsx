import { useEffect, useMemo, useRef, useState } from "react";
import type { ToolDefinition } from "../../../types/tool";
import { FileDropZone } from "../FileDropZone";
import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { LoadingState } from "../../ui/LoadingState";
import { downloadBlob } from "../../../lib/downloadBlob";
import { formatFileSize } from "../../../lib/format";
import { canvasToBlob, FORMAT_LABELS, ImageLoadError, loadImageFile, makeCanvas, outputName, scaledCopy, type OutputFormat } from "../../../lib/pixel/imageIO";
import { controlsFor, type StudioControl, type StudioSpec, type StudioValues } from "../../../lib/pixel/studio";
import { rgbToHex } from "../../../lib/pixel/pixels";
import { STUDIO_SPECS } from "../../../lib/pixel/specs";
import { PrivacyLine, inputClass, labelClass, panelClass } from "./shared";

/** Longest side of the copy used for the live preview; downloads always use the full-size image. */
const PREVIEW_SIDE = 1200;

/** Applies a partial update (preset, picked colour, image-derived values) to the current settings. */
const merge = (a: StudioValues, b: Partial<StudioValues> = {}): StudioValues => ({ ...a, ...b }) as StudioValues;

/**
 * Shared workspace for the canvas-based Pixel Playground tools: upload →
 * live preview while adjusting settings → download at full size. Each
 * tool supplies a StudioSpec (controls + render function).
 */
export default function ImageStudioWorkspace({ tool }: { tool: ToolDefinition }) {
  const [spec, setSpec] = useState<StudioSpec | null>(null);
  const [fileName, setFileName] = useState("");
  const [source, setSource] = useState<HTMLCanvasElement | null>(null);
  const [values, setValues] = useState<StudioValues>({});
  const [format, setFormat] = useState<OutputFormat>("png");
  const [quality, setQuality] = useState(92);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastDownload, setLastDownload] = useState<string | null>(null);
  const resultRef = useRef<HTMLCanvasElement>(null);
  const originalRef = useRef<HTMLCanvasElement>(null);

  const toolId = tool.id;
  useEffect(() => {
    let cancelled = false;
    STUDIO_SPECS[toolId]?.().then((m) => {
      if (cancelled) return;
      setSpec(m.default);
      setValues(m.default.defaults);
      setFormat(m.default.formats[0]);
    });
    return () => {
      cancelled = true;
    };
  }, [toolId]);

  const preview = useMemo(() => (source ? scaledCopy(source, PREVIEW_SIDE) : null), [source]);

  // Redraw the preview (debounced to one frame) whenever settings change.
  useEffect(() => {
    if (!spec || !preview) return;
    const frame = requestAnimationFrame(() => {
      try {
        const out = spec.render(preview, values, { preview: true });
        const target = resultRef.current;
        if (!target) return;
        target.width = out.width;
        target.height = out.height;
        target.getContext("2d")!.drawImage(out, 0, 0);
        setError(null);
      } catch {
        setError("The preview couldn't be drawn. Try a smaller image.");
      }
      const original = originalRef.current;
      if (original && (original.width !== preview.width || original.height !== preview.height)) {
        original.width = preview.width;
        original.height = preview.height;
        original.getContext("2d")!.drawImage(preview, 0, 0);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [spec, preview, values]);

  if (!spec) return <LoadingState label="Loading tool…" />;

  const onFiles = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setError(null);
    setLastDownload(null);
    if (file.size > tool.maxFileSize * 1024 * 1024) {
      setError(`"${file.name}" is larger than ${tool.maxFileSize}MB. Try a smaller image, or compress it first.`);
      return;
    }
    setLoading(true);
    try {
      const canvas = await loadImageFile(file);
      setSource(canvas);
      setFileName(file.name);
      // Keep the current settings for the next photo (handy for batches); only image-derived values are refreshed.
      setValues((v) => merge(v, spec.initFromSource?.(canvas)));
    } catch (err) {
      setError(err instanceof ImageLoadError ? err.message : "This image couldn't be opened.");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!source) return;
    setBusy(true);
    setError(null);
    // Let the "Preparing…" state paint before the full-size render blocks the main thread.
    setTimeout(async () => {
      try {
        let out = spec.render(source, values, { preview: false });
        if (format === "jpeg") {
          // JPG has no transparency: flatten onto white rather than letting transparent areas turn black.
          const { canvas, ctx } = makeCanvas(out.width, out.height);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, out.width, out.height);
          ctx.drawImage(out, 0, 0);
          out = canvas;
        }
        const blob = await canvasToBlob(out, format, quality / 100);
        downloadBlob(blob, outputName(fileName, spec.fileSuffix, format));
        setLastDownload(`${out.width} × ${out.height} px · ${FORMAT_LABELS[format]} · ${formatFileSize(blob.size)}`);
      } catch {
        setError("The image couldn't be saved. Your device may be low on memory — try a smaller photo.");
      } finally {
        setBusy(false);
      }
    }, 30);
  };

  const pickFromOriginal = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!spec.pick || !preview) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const px = preview.getContext("2d")!.getImageData(Math.floor(x * (preview.width - 1)), Math.floor(y * (preview.height - 1)), 1, 1).data;
    setValues((v) => merge(v, spec.pick!({ x, y, hex: rgbToHex({ r: px[0], g: px[1], b: px[2] }) }, v)));
  };

  const set = (key: string, value: number | string | boolean) => setValues((v) => ({ ...v, [key]: value }));
  const showOriginal = spec.showOriginal || Boolean(spec.pick);

  if (!source) {
    return (
      <div className={panelClass}>
        <FileDropZone acceptedFormats={tool.acceptedFormats} acceptedMime={tool.acceptedMime} maxFileSizeMB={tool.maxFileSize} multiple={false} onFilesAdded={onFiles} />
        {loading && <LoadingState label="Opening image…" />}
        {error && <Alert variant="error">{error}</Alert>}
        <PrivacyLine>Your image is processed in your browser and never uploaded.</PrivacyLine>
      </div>
    );
  }

  return (
    <div className={panelClass}>
      <div className={`grid gap-3 ${showOriginal ? "sm:grid-cols-2" : ""}`}>
        {showOriginal && (
          <figure className="flex flex-col gap-1.5">
            <canvas
              ref={originalRef}
              onClick={pickFromOriginal}
              className={`checkerboard h-auto max-h-[420px] w-full rounded-lg border border-neutral-200 object-contain ${spec.pick ? "cursor-crosshair" : ""}`}
              aria-label="Original image"
              role="img"
            />
            <figcaption className="text-xs text-neutral-600">Original{spec.pickHint ? ` — ${spec.pickHint}` : ""}</figcaption>
          </figure>
        )}
        <figure className="flex flex-col gap-1.5">
          <canvas ref={resultRef} className="checkerboard h-auto max-h-[420px] w-full rounded-lg border border-neutral-200 object-contain" aria-label="Preview of the result" role="img" />
          <figcaption className="text-xs text-neutral-600">Preview{showOriginal ? " of the result" : ""} — the download is full size.</figcaption>
        </figure>
      </div>

      {spec.presets && (
        <div role="group" aria-label="Presets" className="flex flex-wrap gap-2">
          {spec.presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setValues((v) => merge(v, p.values))}
              className="focus-ring rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-brand-100 hover:text-brand-700"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {controlsFor(spec, values).map((c) => (
          <Control key={c.key} control={c} value={values[c.key]} onChange={(v) => set(c.key, v)} id={`${tool.id}-${c.key}`} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 border-t border-neutral-200 pt-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${tool.id}-format`} className={labelClass}>
            Download format
          </label>
          <select id={`${tool.id}-format`} value={format} onChange={(e) => setFormat(e.target.value as OutputFormat)} className={inputClass}>
            {spec.formats.map((f) => (
              <option key={f} value={f}>
                {FORMAT_LABELS[f]}
                {f === "png" ? " — keeps transparency" : f === "jpeg" ? " — smallest for photos" : ""}
              </option>
            ))}
          </select>
        </div>
        {format !== "png" && (
          <Control control={{ type: "range", key: "quality", label: "Quality", min: 50, max: 100, unit: "%" }} value={quality} onChange={(v) => setQuality(Number(v))} id={`${tool.id}-quality`} />
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {lastDownload && <Alert variant="success">Downloaded: {lastDownload}</Alert>}

      <div className="flex flex-wrap gap-2">
        <Button onClick={download} disabled={busy}>
          {busy ? "Preparing…" : `Download ${FORMAT_LABELS[format]}`}
        </Button>
        <Button variant="secondary" onClick={() => setValues(merge(spec.defaults, spec.initFromSource?.(source)))}>
          Reset settings
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setSource(null);
            setLastDownload(null);
            setError(null);
          }}
        >
          Choose another image
        </Button>
      </div>
      <PrivacyLine>Your image is processed in your browser and never uploaded.</PrivacyLine>
    </div>
  );
}

function Control({ control, value, onChange, id }: { control: StudioControl; value: number | string | boolean | undefined; onChange: (v: number | string | boolean) => void; id: string }) {
  switch (control.type) {
    case "range":
      return (
        <div>
          <label htmlFor={id} className={`${labelClass} flex justify-between`}>
            <span>{control.label}</span>
            <span className="font-normal text-neutral-600">
              {String(value)}
              {control.unit?.startsWith("%") ? "%" : ""}
            </span>
          </label>
          <input id={id} type="range" min={control.min} max={control.max} step={control.step ?? 1} value={Number(value)} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--color-brand-600)]" />
          {control.unit && control.unit !== "%" && <p className="text-xs text-neutral-600">{control.unit.replace(/^%\s*/, "Percent ")}</p>}
        </div>
      );
    case "select":
      return (
        <div>
          <label htmlFor={id} className={labelClass}>
            {control.label}
          </label>
          <select id={id} value={String(value)} onChange={(e) => onChange(e.target.value)} className={inputClass}>
            {control.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
    case "color":
      return (
        <div>
          <label htmlFor={id} className={labelClass}>
            {control.label}
          </label>
          <div className="flex items-center gap-2">
            <input id={id} type="color" value={String(value) || "#ffffff"} onChange={(e) => onChange(e.target.value)} className="h-11 w-16 cursor-pointer rounded-[var(--radius-control)] border border-neutral-200 bg-white p-1" />
            <span className="font-mono text-xs text-neutral-600">{String(value)}</span>
          </div>
        </div>
      );
    case "toggle":
      return (
        <div className="sm:col-span-2">
          <label className="flex items-start gap-2 text-sm text-neutral-900">
            <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4" />
            <span>
              <span className="font-semibold">{control.label}</span>
              {control.help && <span className="block text-xs text-neutral-600">{control.help}</span>}
            </span>
          </label>
        </div>
      );
    case "text":
      return (
        <div className="sm:col-span-2">
          <label htmlFor={id} className={labelClass}>
            {control.label}
          </label>
          <input id={id} type="text" value={String(value ?? "")} maxLength={control.maxLength} placeholder={control.placeholder} onChange={(e) => onChange(e.target.value)} className={inputClass} />
        </div>
      );
  }
}
