import { useEffect, useId, useState } from "react";
import { downloadBlob } from "../../lib/downloadBlob";
import { Button } from "../ui/Button";

const SIZES = [256, 512, 1024, 2048];
const MARGINS = [0, 1, 2, 4, 6, 8];

/**
 * QR code for a link, generated in the browser with the `qrcode` library (lazy-loaded; no API, nothing sent
 * anywhere). The code encodes exactly `value`, which is shown under the preview so it can be checked.
 */
export function QrDownload({ value, fileBase }: { value: string; fileBase: string }) {
  const id = useId();
  const [size, setSize] = useState(1024);
  const [margin, setMargin] = useState(4);
  const [preview, setPreview] = useState<{ png: string; svg: string; key: string } | null>(null);
  const [failed, setFailed] = useState(false);
  const key = `${value}|${size}|${margin}`;

  useEffect(() => {
    let cancelled = false;
    import("qrcode")
      .then(async ({ default: QRCode }) => {
        const options = { errorCorrectionLevel: "M" as const, margin, width: size };
        const [png, svg] = await Promise.all([QRCode.toDataURL(value, options), QRCode.toString(value, { ...options, type: "svg" })]);
        if (!cancelled) {
          setPreview({ png, svg, key: `${value}|${size}|${margin}` });
          setFailed(false);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [value, size, margin]);

  const ready = preview !== null && preview.key === key;

  const downloadPng = async () => {
    if (!ready) return;
    downloadBlob(await (await fetch(preview.png)).blob(), `${fileBase}-${size}px.png`);
  };
  const downloadSvg = () => {
    if (ready) downloadBlob(new Blob([preview.svg], { type: "image/svg+xml" }), `${fileBase}.svg`);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex shrink-0 flex-col items-center gap-1">
        {preview ? (
          <img src={preview.png} alt={`QR code for ${value}`} width={160} height={160} className="h-40 w-40 rounded-lg border border-neutral-200 bg-white" />
        ) : (
          <div className="h-40 w-40 rounded-lg border border-dashed border-neutral-200 bg-white" aria-hidden="true" />
        )}
        <p className="max-w-40 truncate font-mono text-[11px] text-neutral-600" title={value}>
          {value}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          <div>
            <label htmlFor={`${id}-size`} className="mb-1 block text-xs font-semibold text-neutral-900">
              PNG size
            </label>
            <select id={`${id}-size`} value={size} onChange={(e) => setSize(Number(e.target.value))} className="focus-ring h-10 rounded-[var(--radius-control)] border border-neutral-200 bg-white px-2 text-sm">
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s} × {s} px
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-margin`} className="mb-1 block text-xs font-semibold text-neutral-900">
              Quiet zone (margin)
            </label>
            <select id={`${id}-margin`} value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="focus-ring h-10 rounded-[var(--radius-control)] border border-neutral-200 bg-white px-2 text-sm">
              {MARGINS.map((m) => (
                <option key={m} value={m}>
                  {m} module{m === 1 ? "" : "s"}
                  {m === 4 ? " (recommended)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={downloadPng} disabled={!ready}>
            Download PNG
          </Button>
          <Button variant="secondary" onClick={downloadSvg} disabled={!ready}>
            Download SVG
          </Button>
        </div>
        {margin < 4 && <p className="text-xs text-neutral-600">Scanners work best with a margin of 4; use a smaller one only if the code sits on a plain light background.</p>}
        {failed && <p className="text-xs text-error-600">The QR code couldn't be generated. Try again.</p>}
      </div>
    </div>
  );
}
