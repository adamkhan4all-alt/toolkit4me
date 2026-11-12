import { useEffect, useMemo, useRef, useState } from "react";
import type { ToolDefinition } from "../../../types/tool";
import { FileDropZone } from "../FileDropZone";
import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { LoadingState } from "../../ui/LoadingState";
import { downloadBlob } from "../../../lib/downloadBlob";
import { canvasToBlob, ImageLoadError, loadImageFile, makeCanvas, outputName } from "../../../lib/pixel/imageIO";
import { extractPalette, luminance, type PaletteColour } from "../../../lib/pixel/pixels";
import { CopyButton, PrivacyLine, inputClass, labelClass, panelClass } from "./shared";

/** Palette extraction samples a scaled copy — 600 px is plenty to find dominant colours and keeps it instant. */
const ANALYSIS_SIDE = 600;

export default function PaletteWorkspace({ tool }: { tool: ToolDefinition }) {
  const [source, setSource] = useState<HTMLCanvasElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [count, setCount] = useState(6);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const palette = useMemo<PaletteColour[]>(() => {
    if (!source) return [];
    const img = source.getContext("2d")!.getImageData(0, 0, source.width, source.height);
    return extractPalette({ data: img.data, width: img.width, height: img.height }, count);
  }, [source, count]);

  useEffect(() => {
    if (!source) return;
    const target = previewRef.current;
    if (target) {
      target.width = source.width;
      target.height = source.height;
      target.getContext("2d")!.drawImage(source, 0, 0);
    }
  }, [source]);

  const onFiles = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setError(null);
    if (file.size > tool.maxFileSize * 1024 * 1024) {
      setError(`"${file.name}" is larger than ${tool.maxFileSize}MB.`);
      return;
    }
    setLoading(true);
    try {
      setSource(await loadImageFile(file, ANALYSIS_SIDE));
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof ImageLoadError ? err.message : "This image couldn't be opened.");
    } finally {
      setLoading(false);
    }
  };

  const css = palette.map((c, i) => `  --colour-${i + 1}: ${c.hex};`).join("\n");
  const cssBlock = palette.length ? `:root {\n${css}\n}` : "";
  const hexList = palette.map((c) => c.hex).join(", ");

  const downloadSwatches = async () => {
    const sw = 200;
    const { canvas, ctx } = makeCanvas(sw * palette.length, 260);
    palette.forEach((c, i) => {
      ctx.fillStyle = c.hex;
      ctx.fillRect(i * sw, 0, sw, 200);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(i * sw, 200, sw, 60);
      ctx.fillStyle = "#12142a";
      ctx.font = "600 22px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(c.hex.toUpperCase(), i * sw + sw / 2, 238);
    });
    downloadBlob(await canvasToBlob(canvas, "png"), outputName(fileName, "palette", "png"));
  };

  if (!source) {
    return (
      <div className={panelClass}>
        <FileDropZone acceptedFormats={tool.acceptedFormats} acceptedMime={tool.acceptedMime} maxFileSizeMB={tool.maxFileSize} multiple={false} onFilesAdded={onFiles} />
        {loading && <LoadingState label="Opening image…" />}
        {error && <Alert variant="error">{error}</Alert>}
        <PrivacyLine>Your image is analysed in your browser and never uploaded.</PrivacyLine>
      </div>
    );
  }

  return (
    <div className={panelClass}>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <canvas ref={previewRef} className="checkerboard h-auto max-h-[360px] w-full rounded-lg border border-neutral-200 object-contain" role="img" aria-label="Your image" />
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="palette-count" className={labelClass}>
              Number of colours
            </label>
            <select id="palette-count" value={count} onChange={(e) => setCount(Number(e.target.value))} className={inputClass}>
              {[3, 4, 5, 6, 8, 10, 12].map((n) => (
                <option key={n} value={n}>
                  {n} colours
                </option>
              ))}
            </select>
          </div>
          <ul className="grid grid-cols-2 gap-2" aria-label="Extracted colours, most common first">
            {palette.map((c) => (
              <li key={c.hex}>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(c.hex)}
                  title={`Copy ${c.hex}`}
                  className="focus-ring flex w-full flex-col overflow-hidden rounded-lg border border-neutral-200 text-left"
                >
                  <span className="flex h-14 items-end p-2 text-xs font-semibold" style={{ background: c.hex, color: luminance(c) > 0.4 ? "#12142a" : "#ffffff" }}>
                    {Math.round(c.share * 100)}%
                  </span>
                  <span className="bg-white px-2 py-1.5 font-mono text-xs text-neutral-900">
                    {c.hex.toUpperCase()} <span className="text-neutral-600">rgb({c.r}, {c.g}, {c.b})</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-neutral-600">Click a colour to copy its hex code. Percentages show roughly how much of the image each colour covers.</p>
        </div>
      </div>

      <div>
        <p className={labelClass}>CSS variables</p>
        <pre className="overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-3 font-mono text-xs text-neutral-900">{cssBlock}</pre>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton text={hexList} label="Copy hex codes" />
        <CopyButton text={cssBlock} label="Copy CSS" />
        <Button variant="secondary" onClick={downloadSwatches}>
          Download palette PNG
        </Button>
        <Button variant="secondary" onClick={() => setSource(null)}>
          Choose another image
        </Button>
      </div>
      <PrivacyLine>Your image is analysed in your browser and never uploaded.</PrivacyLine>
    </div>
  );
}
