import { useId, useState } from "react";
import type { ToolDefinition } from "../../../types/tool";
import { Alert } from "../../ui/Alert";
import { cleanUrl, DEFAULT_CLEAN_OPTIONS, parseUrl, type CleanOptions } from "../../../lib/linkTools/urlCleaner";
import { CopyButton, PrivacyLine, inputClass, labelClass, panelClass, textareaClass } from "./shared";

const OPTION_LABELS: { key: keyof CleanOptions; label: string }[] = [
  { key: "removeTracking", label: "Remove tracking parameters (utm_*, fbclid, gclid…)" },
  { key: "removeEmptyParams", label: "Remove empty parameters" },
  { key: "removeAllParams", label: "Remove all parameters" },
  { key: "removeFragment", label: "Remove the #fragment" },
  { key: "sortParams", label: "Sort parameters A–Z" },
  { key: "removeTrailingSlash", label: "Remove trailing slash" },
  { key: "removeWww", label: "Remove www." },
];

const EXAMPLE = "https://www.example.com/products/shoes/?colour=red&size=9&utm_source=newsletter&utm_medium=email&fbclid=IwAR2xYz#reviews";

export default function UrlCleanerWorkspace(_props: { tool: ToolDefinition }) {
  const id = useId();
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<CleanOptions>(DEFAULT_CLEAN_OPTIONS);

  const parsed = input.trim() ? parseUrl(input) : null;
  const cleaned = parsed?.ok ? cleanUrl(input, options) : null;
  const url = parsed?.ok ? parsed.url : null;

  const rows: [string, string][] = url
    ? ([
        ["Scheme", url.scheme],
        ["Domain", url.host],
        ["Port", url.port || "(default)"],
        ["User name", url.username],
        ["Path", decodeSafe(url.path)],
        ["Query string", url.query || "(none)"],
        ["Fragment", url.fragment || "(none)"],
      ].filter(([, v]) => v !== "") as [string, string][])
    : [];

  return (
    <div className={panelClass}>
      <div>
        <label htmlFor={`${id}-in`} className={labelClass}>
          Link to parse and clean
        </label>
        <input
          id={`${id}-in`}
          type="url"
          inputMode="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a link…"
          autoComplete="off"
          spellCheck={false}
          className={inputClass}
        />
        {!input && (
          <button type="button" onClick={() => setInput(EXAMPLE)} className="focus-ring mt-1 rounded text-xs font-semibold text-brand-700 hover:underline">
            Try an example
          </button>
        )}
      </div>

      <fieldset className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <legend className={labelClass}>Clean-up options</legend>
        {OPTION_LABELS.map((o) => (
          <label key={o.key} className="flex items-center gap-2 text-sm text-neutral-900">
            <input type="checkbox" checked={options[o.key]} onChange={(e) => setOptions((prev) => ({ ...prev, [o.key]: e.target.checked }))} className="h-4 w-4" />
            {o.label}
          </label>
        ))}
      </fieldset>

      {parsed && !parsed.ok && <Alert variant="error">{parsed.error}</Alert>}

      {cleaned?.ok && (
        <>
          <div>
            <label htmlFor={`${id}-out`} className={labelClass}>
              Cleaned link
            </label>
            <textarea id={`${id}-out`} value={cleaned.url} readOnly rows={3} spellCheck={false} className={`${textareaClass} break-all`} />
            <p className="mt-1 text-xs text-neutral-600">
              {cleaned.changed
                ? `${(url!.href.length - cleaned.url.length).toLocaleString()} characters shorter. Removed: ${cleaned.removed.length > 0 ? cleaned.removed.join(", ") : "formatting only"}.`
                : "Nothing to remove with these options — the link is already clean."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={cleaned.url} label="Copy cleaned link" />
          </div>
        </>
      )}

      {url && (
        <section aria-labelledby={`${id}-parts`} className="flex flex-col gap-3">
          <h3 id={`${id}-parts`} className="text-base font-semibold text-neutral-900">
            What's in this link
          </h3>
          <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="w-full text-left text-sm">
              <tbody>
                {rows.map(([k, v]) => (
                  <tr key={k} className="border-t border-neutral-200 first:border-t-0">
                    <th scope="row" className="w-36 bg-neutral-50 px-3 py-2 font-medium text-neutral-900">
                      {k}
                    </th>
                    <td className="px-3 py-2 font-mono text-xs break-all text-neutral-700">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {url.params.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-neutral-200">
              <table className="w-full min-w-[420px] text-left text-sm">
                <caption className="px-3 py-2 text-left text-xs text-neutral-600">Query parameters, decoded ({url.params.length})</caption>
                <thead className="bg-neutral-100 text-neutral-900">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-semibold">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-2 font-semibold">
                      Value
                    </th>
                    <th scope="col" className="px-3 py-2 font-semibold">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {url.params.map((p, i) => (
                    <tr key={`${p.raw}-${i}`} className="border-t border-neutral-200">
                      <td className="px-3 py-2 font-mono text-xs break-all text-neutral-900">{p.name}</td>
                      <td className="px-3 py-2 font-mono text-xs break-all text-neutral-700">{p.value || "(empty)"}</td>
                      <td className="px-3 py-2 text-xs">
                        {p.tracking ? <span className="rounded bg-warning-50 px-1.5 py-0.5 font-semibold text-warning-600">Tracking</span> : <span className="text-neutral-600">Page</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <PrivacyLine>Parsed in your browser — the link isn't sent to a server.</PrivacyLine>
    </div>
  );
}

function decodeSafe(path: string): string {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}
