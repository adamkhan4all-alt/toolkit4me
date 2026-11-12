import { useId, useState } from "react";
import type { ToolDefinition } from "../../../types/tool";
import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { decodeUrlText, encodeUrlText, UrlCodecError, type EncodeMode } from "../../../lib/linkTools/urlCodec";
import { CharCount, CopyButton, PrivacyLine, labelClass, panelClass, textareaClass } from "./shared";

const MAX_CHARS = 100_000;

const MODES: { value: EncodeMode; label: string; help: string }[] = [
  { value: "component", label: "A single value", help: "Query parameter values and path segments. Encodes & ? / = too." },
  { value: "fullUrl", label: "A whole address", help: "Keeps : / ? & = # so the link's structure survives." },
  { value: "form", label: "Form data", help: "Like a single value, but spaces become +." },
];

type Output = { kind: "ok"; text: string; doubleEncoded: boolean } | { kind: "error"; message: string };

export default function UrlCodecWorkspace({ tool }: { tool: ToolDefinition }) {
  const id = useId();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<EncodeMode>("component");
  const [plusAsSpace, setPlusAsSpace] = useState(false);
  const [output, setOutput] = useState<Output | null>(null);
  const tooLong = input.length > MAX_CHARS;

  const run = (fn: () => Output) => {
    try {
      setOutput(fn());
    } catch (err) {
      setOutput({ kind: "error", message: err instanceof UrlCodecError ? err.message : "That couldn't be converted." });
    }
  };
  const encode = () => run(() => ({ kind: "ok", text: encodeUrlText(input, mode), doubleEncoded: false }));
  const decode = (text = input) =>
    run(() => {
      const r = decodeUrlText(text, plusAsSpace);
      return { kind: "ok", text: r.text, doubleEncoded: r.looksDoubleEncoded };
    });

  return (
    <div className={panelClass}>
      <div>
        <label htmlFor={`${id}-in`} className={labelClass}>
          Text or encoded URL
        </label>
        <textarea
          id={`${id}-in`}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOutput(null);
          }}
          rows={6}
          spellCheck={false}
          placeholder="Paste text to encode, or something like caf%C3%A9%20menu to decode…"
          className={textareaClass}
        />
        <CharCount value={input} limit={MAX_CHARS} />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className={labelClass}>When encoding, the text is…</legend>
        {MODES.map((m) => (
          <label key={m.value} className="flex items-start gap-2 text-sm text-neutral-900">
            <input type="radio" name={`${id}-mode`} value={m.value} checked={mode === m.value} onChange={() => setMode(m.value)} className="mt-1 h-4 w-4" />
            <span>
              <span className="font-medium">{m.label}</span> <span className="text-neutral-600">— {m.help}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <label className="flex items-center gap-2 text-sm text-neutral-900">
        <input type="checkbox" checked={plusAsSpace} onChange={(e) => setPlusAsSpace(e.target.checked)} className="h-4 w-4" />
        When decoding, treat + as a space (form data and query strings)
      </label>

      <div className="flex flex-wrap gap-2">
        <Button onClick={encode} disabled={!input || tooLong}>
          {tool.actionLabel}
        </Button>
        <Button variant="secondary" onClick={() => decode()} disabled={!input || tooLong}>
          Decode
        </Button>
      </div>
      {tooLong && <Alert variant="error">Input is limited to {MAX_CHARS.toLocaleString()} characters.</Alert>}

      {output?.kind === "error" && <Alert variant="error">{output.message}</Alert>}
      {output?.kind === "ok" && (
        <>
          <div>
            <label htmlFor={`${id}-out`} className={labelClass}>
              Result
            </label>
            <textarea id={`${id}-out`} value={output.text} readOnly rows={6} spellCheck={false} className={`${textareaClass} break-all`} />
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={output.text} />
            <Button
              variant="secondary"
              onClick={() => {
                setInput(output.text);
                setOutput(null);
              }}
            >
              Use result as input
            </Button>
          </div>
          {output.doubleEncoded && (
            <Alert variant="info" title="Still contains % sequences">
              <p className="mb-2">The text looks like it was encoded twice (for example %2520 instead of %20).</p>
              <Button variant="secondary" onClick={() => decode(output.text)}>
                Decode again
              </Button>
            </Alert>
          )}
        </>
      )}

      <PrivacyLine>Converted in your browser — nothing is sent to a server.</PrivacyLine>
    </div>
  );
}
