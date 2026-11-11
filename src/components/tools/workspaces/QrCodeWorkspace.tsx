import { useEffect, useRef, useState } from "react";
import type { ToolDefinition } from "../../../types/tool";
import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { downloadBlob } from "../../../lib/downloadBlob";
import { colourWarning, linkHint, QR_MAX_BYTES, utf8Length, validateQrText, type QrErrorLevel } from "../../../lib/textTools/qr";
import { PrivacyLine, inputClass, labelClass, panelClass, textareaClass } from "./shared";

const SIZES = [256, 512, 1024];

export default function QrCodeWorkspace({ tool }: { tool: ToolDefinition }) {
  const [text, setText] = useState("https://www.toolkit4me.com");
  const [level, setLevel] = useState<QrErrorLevel>("M");
  const [size, setSize] = useState(512);
  const [foreground, setForeground] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const inputError = validateQrText(text, level);
  const warning = colourWarning(foreground, background);
  const hint = inputError ? null : linkHint(text);

  // Re-render the preview (debounced) whenever an input changes. The qrcode
  // library is imported here, on demand, so it never ships with other pages.
  useEffect(() => {
    // Invalid input: keep the last render but `ready` (below) hides it and disables the downloads.
    if (inputError) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const options = { errorCorrectionLevel: level, margin: 4, width: size, color: { dark: foreground, light: background } };
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, text, options);
          // qrcode pins inline width/height in px; drop them so the preview scales with the layout on small screens.
          canvasRef.current.style.width = "";
          canvasRef.current.style.height = "";
        }
        const markup = await QRCode.toString(text, { ...options, type: "svg" });
        if (!cancelled) {
          setSvg(markup);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setSvg("");
          setError(err instanceof Error && /too big/i.test(err.message) ? "This text is too long to fit in a QR code." : "The QR code couldn't be generated. Please try again.");
        }
      }
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [text, level, size, foreground, background, inputError]);

  const downloadPng = () => {
    canvasRef.current?.toBlob((blob) => blob && downloadBlob(blob, `qr-code-${size}px.png`), "image/png");
  };
  const ready = !inputError && !error && Boolean(svg);

  return (
    <div className={panelClass}>
      <div>
        <label htmlFor="qr-text" className={labelClass}>
          Link or text to encode
        </label>
        <textarea id="qr-text" aria-describedby="qr-text-help" placeholder="https://www.example.com" value={text} onChange={(e) => setText(e.target.value)} rows={3} className={textareaClass} />
        <p id="qr-text-help" className="mt-1 text-xs text-neutral-600">
          Paste a full link starting with https:// — the preview updates as you type. {utf8Length(text).toLocaleString()} / {QR_MAX_BYTES[level].toLocaleString()} bytes at this error-correction level
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="qr-level" className={labelClass}>
            Error correction
          </label>
          <select id="qr-level" value={level} onChange={(e) => setLevel(e.target.value as QrErrorLevel)} className={inputClass}>
            <option value="L">Low (7%) — most data</option>
            <option value="M">Medium (15%) — recommended</option>
            <option value="Q">Quartile (25%)</option>
            <option value="H">High (30%) — survives damage or a logo overlay</option>
          </select>
        </div>
        <div>
          <label htmlFor="qr-size" className={labelClass}>
            PNG size
          </label>
          <select id="qr-size" value={size} onChange={(e) => setSize(Number(e.target.value))} className={inputClass}>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s} × {s} px
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="qr-fg" className={labelClass}>
            Code colour
          </label>
          <input id="qr-fg" type="color" value={foreground} onChange={(e) => setForeground(e.target.value)} className="h-11 w-full cursor-pointer rounded-[var(--radius-control)] border border-neutral-200 bg-white p-1" />
        </div>
        <div>
          <label htmlFor="qr-bg" className={labelClass}>
            Background colour
          </label>
          <input id="qr-bg" type="color" value={background} onChange={(e) => setBackground(e.target.value)} className="h-11 w-full cursor-pointer rounded-[var(--radius-control)] border border-neutral-200 bg-white p-1" />
        </div>
      </div>

      {inputError && <Alert variant={text.trim() ? "error" : "info"}>{inputError}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}
      {hint && (
        <Alert variant="warning">
          <span>{hint.message}</span>
          {hint.fix && (
            <button type="button" onClick={() => setText(hint.fix!)} className="ml-2 font-semibold text-brand-700 underline underline-offset-2">
              {hint.fixLabel}
            </button>
          )}
        </Alert>
      )}
      {warning && !inputError && <Alert variant="warning">{warning}</Alert>}

      <div className="flex flex-col items-center gap-3">
        <canvas
          ref={canvasRef}
          aria-label={ready ? `QR code for: ${text}` : "QR code preview"}
          role="img"
          className={`h-auto w-full max-w-[280px] rounded-md border border-neutral-200 ${ready ? "" : "hidden"}`}
        />
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={downloadPng} disabled={!ready}>
            {tool.actionLabel}
          </Button>
          <Button variant="secondary" disabled={!ready} onClick={() => downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "qr-code.svg")}>
            Download SVG
          </Button>
        </div>
        <p className="text-center text-xs text-neutral-600">Test the code with your phone's camera before printing it.</p>
      </div>

      <PrivacyLine>Generated in your browser — the text you encode is never sent to a server.</PrivacyLine>
    </div>
  );
}
