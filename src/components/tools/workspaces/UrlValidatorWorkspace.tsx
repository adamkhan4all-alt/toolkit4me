import { useId, useState, type FormEvent } from "react";
import type { ToolDefinition } from "../../../types/tool";
import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { validateUrl, type CheckSeverity, type UrlValidation } from "../../../lib/linkTools/urlValidator";
import { CopyButton, PrivacyLine, inputClass, labelClass, panelClass } from "./shared";

const BADGE: Record<CheckSeverity, { label: string; className: string }> = {
  error: { label: "Error", className: "bg-error-50 text-error-600" },
  warning: { label: "Warning", className: "bg-warning-50 text-warning-600" },
  info: { label: "Note", className: "bg-brand-50 text-brand-700" },
};

export default function UrlValidatorWorkspace({ tool }: { tool: ToolDefinition }) {
  const id = useId();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<UrlValidation | null>(null);

  const check = (value = input) => setResult(validateUrl(value));
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    check();
  };

  const errors = result?.checks.filter((c) => c.severity === "error").length ?? 0;
  const warnings = result?.checks.filter((c) => c.severity === "warning").length ?? 0;

  return (
    <div className={panelClass}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div>
          <label htmlFor={`${id}-in`} className={labelClass}>
            Web address to check
          </label>
          <input
            id={`${id}-in`}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setResult(null);
            }}
            placeholder="https://www.example.com/page"
            autoComplete="off"
            spellCheck={false}
            className={inputClass}
          />
        </div>
        <div>
          <Button type="submit" disabled={!input.trim()}>
            {tool.actionLabel}
          </Button>
        </div>
      </form>

      {result && (
        <div className="flex flex-col gap-4" aria-live="polite">
          {result.valid ? (
            <Alert variant={warnings > 0 ? "warning" : "success"} title={warnings > 0 ? "Valid, with warnings" : "Valid URL"}>
              {warnings > 0 ? `The address is well-formed, but ${warnings === 1 ? "one thing deserves" : `${warnings} things deserve`} a second look.` : "The address is complete and well-formed."}
            </Alert>
          ) : (
            <Alert variant="error" title="Not a valid URL">
              {errors === 1 ? "There's one problem to fix." : `There are ${errors} problems to fix.`}
            </Alert>
          )}

          <ul className="flex flex-col gap-2">
            {result.checks.map((c) => (
              <li key={c.message} className="flex items-start gap-2 text-sm leading-6 text-neutral-700">
                <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold ${BADGE[c.severity].className}`}>{BADGE[c.severity].label}</span>
                <span>{c.message}</span>
              </li>
            ))}
          </ul>

          {result.suggestion && (
            <div className="flex flex-col gap-2 rounded-lg border border-brand-100 bg-brand-50 p-3">
              <p className="text-sm text-neutral-900">
                Suggested fix: <code className="font-mono text-xs break-all">{result.suggestion}</code>
              </p>
              <div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setInput(result.suggestion!);
                    check(result.suggestion);
                  }}
                >
                  Use and re-check
                </Button>
              </div>
            </div>
          )}

          {result.normalized && result.parts && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-neutral-900">How browsers read it</p>
              <code className="block rounded-lg border border-neutral-200 bg-neutral-50 p-3 font-mono text-xs break-all text-neutral-900">{result.normalized}</code>
              <div className="flex flex-wrap gap-2">
                <CopyButton text={result.normalized} label="Copy" />
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                {(
                  [
                    ["Scheme", result.parts.scheme],
                    ["Domain", result.parts.host],
                    ["Port", result.parts.port || "(default)"],
                    ["Path", result.parts.path],
                    ["Query", result.parts.query || "(none)"],
                    ["Fragment", result.parts.fragment || "(none)"],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="font-medium text-neutral-900">{k}</dt>
                    <dd className="font-mono text-xs leading-6 break-all text-neutral-700">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      )}

      <PrivacyLine>Checked in your browser — the address isn't sent to a server, and the page isn't visited.</PrivacyLine>
    </div>
  );
}
