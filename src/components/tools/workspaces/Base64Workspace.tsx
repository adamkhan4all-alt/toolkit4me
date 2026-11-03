import { useState } from "react";
import type { ToolDefinition } from "../../../types/tool";
import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { downloadBlob } from "../../../lib/downloadBlob";
import { formatFileSize } from "../../../lib/format";
import {
  Base64Error,
  bytesToBase64,
  dataUrlMime,
  decodeBase64,
  encodeText,
  guessExtension,
  MAX_BASE64_FILE_BYTES,
  MAX_BASE64_TEXT_CHARS,
  type DecodeResult,
} from "../../../lib/textTools/base64";
import { CharCount, CopyButton, DownloadTextButton, PrivacyLine, labelClass, panelClass, textareaClass } from "./shared";

type Output = { kind: "encoded"; text: string } | { kind: "decoded"; result: DecodeResult; mime?: string } | { kind: "error"; message: string };

export default function Base64Workspace({ tool }: { tool: ToolDefinition }) {
  const [input, setInput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [asDataUrl, setAsDataUrl] = useState(false);
  const [output, setOutput] = useState<Output | null>(null);

  const encode = () => {
    if (!input) return setOutput({ kind: "error", message: "Type or paste some text to encode." });
    if (input.length > MAX_BASE64_TEXT_CHARS) return setOutput({ kind: "error", message: `Text input is limited to ${MAX_BASE64_TEXT_CHARS.toLocaleString()} characters.` });
    setOutput({ kind: "encoded", text: encodeText(input, urlSafe) });
  };

  const decode = () => {
    try {
      setOutput({ kind: "decoded", result: decodeBase64(input), mime: dataUrlMime(input) });
    } catch (err) {
      setOutput({ kind: "error", message: err instanceof Base64Error ? err.message : "This isn't valid Base64." });
    }
  };

  const encodeFile = async (file: File) => {
    if (file.size > MAX_BASE64_FILE_BYTES) {
      return setOutput({ kind: "error", message: `"${file.name}" is ${formatFileSize(file.size)} — files are limited to ${formatFileSize(MAX_BASE64_FILE_BYTES)}.` });
    }
    const b64 = bytesToBase64(new Uint8Array(await file.arrayBuffer()), urlSafe && !asDataUrl);
    setOutput({ kind: "encoded", text: asDataUrl ? `data:${file.type || "application/octet-stream"};base64,${b64}` : b64 });
  };

  return (
    <div className={panelClass}>
      <div>
        <label htmlFor="b64-input" className={labelClass}>
          Text or Base64
        </label>
        <textarea
          id="b64-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOutput(null);
          }}
          rows={8}
          spellCheck={false}
          placeholder="Paste text to encode, or Base64 to decode…"
          className={textareaClass}
        />
        <CharCount value={input} />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
        <label className="flex items-center gap-2 text-sm text-neutral-900">
          <input type="checkbox" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} className="h-4 w-4" />
          URL-safe output (- and _, no padding)
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-900">
          <input type="checkbox" checked={asDataUrl} onChange={(e) => setAsDataUrl(e.target.checked)} className="h-4 w-4" />
          Encode files as a data: URL
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={encode} disabled={!input}>
          {tool.actionLabel}
        </Button>
        <Button variant="secondary" onClick={decode} disabled={!input.trim()}>
          Decode
        </Button>
        <Button variant="secondary" onClick={() => document.getElementById("b64-file")?.click()}>
          Encode a file…
        </Button>
        <input
          id="b64-file"
          type="file"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void encodeFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {output?.kind === "error" && <Alert variant="error">{output.message}</Alert>}

      {output?.kind === "encoded" && (
        <>
          <div>
            <label htmlFor="b64-output" className={labelClass}>
              Base64
            </label>
            <textarea id="b64-output" value={output.text} readOnly rows={8} spellCheck={false} className={`${textareaClass} break-all`} />
            <p className="mt-1 text-xs text-neutral-600">{output.text.length.toLocaleString()} characters</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={output.text} />
            <DownloadTextButton text={output.text} fileName="encoded.txt" label="Download .txt" />
          </div>
        </>
      )}

      {output?.kind === "decoded" && output.result.kind === "text" && (
        <>
          <div>
            <label htmlFor="b64-decoded" className={labelClass}>
              Decoded text
            </label>
            <textarea id="b64-decoded" value={output.result.text} readOnly rows={8} spellCheck={false} className={textareaClass} />
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={output.result.text} />
            <DownloadTextButton text={output.result.text} fileName="decoded.txt" label="Download .txt" />
          </div>
        </>
      )}

      {output?.kind === "decoded" && output.result.kind === "binary" && (
        <Alert variant="info" title="This decodes to a file, not text">
          <p className="mb-3">
            {formatFileSize(output.result.bytes.length)} of binary data — it looks like a .{guessExtension(output.result.bytes, output.mime)} file.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              if (output.result.kind !== "binary") return;
              const ext = guessExtension(output.result.bytes, output.mime);
              downloadBlob(new Blob([output.result.bytes as BlobPart], { type: output.mime ?? "application/octet-stream" }), `decoded.${ext}`);
            }}
          >
            Download file
          </Button>
        </Alert>
      )}

      <PrivacyLine>Encoded and decoded in your browser — nothing is sent to a server.</PrivacyLine>
    </div>
  );
}
