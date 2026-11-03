import { useState } from "react";
import type { ToolDefinition } from "../../../types/tool";
import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { MAX_JSON_CHARS, processJson, type JsonIndent, type JsonResult } from "../../../lib/textTools/json";
import { CharCount, CopyButton, DownloadTextButton, PrivacyLine, inputClass, labelClass, panelClass, textareaClass } from "./shared";

const SAMPLE = '{"name":"Toolkit4Me","tools":["JSON Formatter","QR Code Generator"],"free":true,"version":2}';

export default function JsonFormatterWorkspace({ tool }: { tool: ToolDefinition }) {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<JsonIndent>("2");
  const [sortKeys, setSortKeys] = useState(false);
  const [result, setResult] = useState<JsonResult | null>(null);

  const run = (mode: "format" | "minify") => setResult(processJson(input, mode, indent, sortKeys));
  const output = result?.ok ? result.output : "";

  return (
    <div className={panelClass}>
      <div>
        <label htmlFor="json-input" className={labelClass}>
          Your JSON
        </label>
        <textarea
          id="json-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setResult(null);
          }}
          rows={10}
          spellCheck={false}
          placeholder='{"example": "Paste your JSON here"}'
          className={textareaClass}
        />
        <CharCount value={input} limit={MAX_JSON_CHARS} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="json-indent" className={labelClass}>
            Indentation
          </label>
          <select id="json-indent" value={indent} onChange={(e) => setIndent(e.target.value as JsonIndent)} className={inputClass}>
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tabs</option>
          </select>
        </div>
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-neutral-900">
          <input type="checkbox" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} className="h-4 w-4" />
          Sort object keys alphabetically
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => run("format")} disabled={!input.trim()}>
          {tool.actionLabel}
        </Button>
        <Button variant="secondary" onClick={() => run("minify")} disabled={!input.trim()}>
          Minify
        </Button>
        <Button
          variant="tertiary"
          onClick={() => {
            setInput(SAMPLE);
            setResult(null);
          }}
        >
          Load example
        </Button>
        {input && (
          <Button
            variant="tertiary"
            onClick={() => {
              setInput("");
              setResult(null);
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {result && !result.ok && (
        <Alert variant="error" title="Invalid JSON">
          <p>
            {result.location ? `Line ${result.location.line}, column ${result.location.column}: ` : ""}
            {result.message}
          </p>
          {result.lineText !== undefined && result.location && (
            <pre className="mt-2 overflow-x-auto rounded bg-white/60 p-2 font-mono text-xs">
              {result.lineText}
              {"\n"}
              {" ".repeat(Math.max(0, result.location.column - 1))}^
            </pre>
          )}
        </Alert>
      )}

      {result?.ok && (
        <>
          <Alert variant="success" title="Valid JSON">
            {result.stats.keys.toLocaleString()} keys, nested {result.stats.depth} level{result.stats.depth === 1 ? "" : "s"} deep ·{" "}
            {output.length.toLocaleString()} characters
          </Alert>
          {result.warnings.map((w) => (
            <Alert key={w} variant="warning">
              {w}
            </Alert>
          ))}
          <div>
            <label htmlFor="json-output" className={labelClass}>
              Result
            </label>
            <textarea id="json-output" value={output} readOnly rows={12} spellCheck={false} className={textareaClass} />
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={output} />
            <DownloadTextButton text={output} fileName="formatted.json" mime="application/json;charset=utf-8" label="Download .json" />
          </div>
        </>
      )}

      <PrivacyLine />
    </div>
  );
}
