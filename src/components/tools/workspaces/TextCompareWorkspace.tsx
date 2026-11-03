import { useRef, useState } from "react";
import type { ToolDefinition } from "../../../types/tool";
import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { compareText, MAX_DIFF_CHARS, unifiedDiff, type DiffMode, type DiffResult } from "../../../lib/textTools/diff";
import { CharCount, DownloadTextButton, PrivacyLine, inputClass, labelClass, panelClass, textareaClass } from "./shared";

export default function TextCompareWorkspace({ tool }: { tool: ToolDefinition }) {
  const [original, setOriginal] = useState("");
  const [changed, setChanged] = useState("");
  const [mode, setMode] = useState<DiffMode>("lines");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [result, setResult] = useState<DiffResult | null>(null);
  const [patch, setPatch] = useState("");
  const [comparing, setComparing] = useState(false);
  const runId = useRef(0);
  // Remember which mode produced the current result, so changing the dropdown doesn't relabel old counts.
  const [resultMode, setResultMode] = useState<DiffMode>("lines");

  const run = async () => {
    const id = ++runId.current;
    setComparing(true);
    setResult(null);
    const r = await compareText(original, changed, { mode, ignoreCase, ignoreWhitespace });
    const p = r.ok && !r.identical ? await unifiedDiff(original, changed) : "";
    if (id !== runId.current) return; // a newer comparison started meanwhile
    setResult(r);
    setResultMode(mode);
    setPatch(p);
    setComparing(false);
  };
  const unit = resultMode === "lines" ? "line" : "word";

  return (
    <div className={panelClass}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="diff-original" className={labelClass}>
            Original text
          </label>
          <textarea id="diff-original" value={original} onChange={(e) => setOriginal(e.target.value)} rows={10} spellCheck={false} className={textareaClass} />
          <CharCount value={original} limit={MAX_DIFF_CHARS} />
        </div>
        <div>
          <label htmlFor="diff-changed" className={labelClass}>
            Changed text
          </label>
          <textarea id="diff-changed" value={changed} onChange={(e) => setChanged(e.target.value)} rows={10} spellCheck={false} className={textareaClass} />
          <CharCount value={changed} limit={MAX_DIFF_CHARS} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="diff-mode" className={labelClass}>
            Compare by
          </label>
          <select id="diff-mode" value={mode} onChange={(e) => setMode(e.target.value as DiffMode)} className={inputClass}>
            <option value="lines">Line</option>
            <option value="words">Word</option>
          </select>
        </div>
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-neutral-900">
          <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} className="h-4 w-4" />
          Ignore upper/lower case
        </label>
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-neutral-900">
          <input
            type="checkbox"
            checked={ignoreWhitespace}
            disabled={mode === "words"}
            onChange={(e) => setIgnoreWhitespace(e.target.checked)}
            className="h-4 w-4"
          />
          Ignore extra spaces {mode === "words" && <span className="text-neutral-600">(line mode)</span>}
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void run()} disabled={(!original && !changed) || comparing}>
          {comparing ? "Comparing…" : tool.actionLabel}
        </Button>
        <Button
          variant="tertiary"
          disabled={!original && !changed}
          onClick={() => {
            setOriginal(changed);
            setChanged(original);
            setResult(null);
          }}
        >
          Swap sides
        </Button>
      </div>

      {result && !result.ok && <Alert variant="error">{result.message}</Alert>}

      {result?.ok && result.identical && <Alert variant="success">No differences found{ignoreCase || ignoreWhitespace ? " with the selected options" : ""}.</Alert>}

      {result?.ok && !result.identical && (
        <>
          <p className="text-sm text-neutral-700" aria-live="polite">
            <span className="font-semibold text-success-600">
              +{result.added.toLocaleString()} {unit}
              {result.added === 1 ? "" : "s"} added
            </span>{" "}
            ·{" "}
            <span className="font-semibold text-error-600">
              −{result.removed.toLocaleString()} {unit}
              {result.removed === 1 ? "" : "s"} removed
            </span>
          </p>
          <div className="max-h-[480px] overflow-auto rounded-lg border border-neutral-200 font-mono text-sm leading-6" aria-label="Differences">
            {resultMode === "lines" ? (
              result.parts.flatMap((part, i) =>
                part.value
                  .replace(/\n$/, "")
                  .split("\n")
                  .map((line, j) => (
                    <div
                      key={`${i}-${j}`}
                      className={`flex whitespace-pre-wrap break-all px-3 ${part.added ? "bg-success-50" : part.removed ? "bg-error-50" : ""}`}
                    >
                      <span aria-hidden="true" className={`w-5 shrink-0 select-none ${part.added ? "text-success-600" : part.removed ? "text-error-600" : "text-neutral-400"}`}>
                        {part.added ? "+" : part.removed ? "−" : " "}
                      </span>
                      <span>
                        {part.added && <span className="sr-only">Added: </span>}
                        {part.removed && <span className="sr-only">Removed: </span>}
                        {line || " "}
                      </span>
                    </div>
                  ))
              )
            ) : (
              <p className="whitespace-pre-wrap break-words p-3">
                {result.parts.map((part, i) =>
                  part.added ? (
                    <ins key={i} className="rounded bg-success-50 text-success-600 no-underline">
                      {part.value}
                    </ins>
                  ) : part.removed ? (
                    <del key={i} className="rounded bg-error-50 text-error-600">
                      {part.value}
                    </del>
                  ) : (
                    <span key={i}>{part.value}</span>
                  )
                )}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {patch ? (
              <DownloadTextButton text={patch} fileName="changes.diff" mime="text/x-diff;charset=utf-8" label="Download .diff" />
            ) : (
              <p className="text-xs text-neutral-600">These texts are too large to build a downloadable .diff file quickly.</p>
            )}
          </div>
        </>
      )}

      <PrivacyLine>Compared in your browser — neither text is sent to a server.</PrivacyLine>
    </div>
  );
}
