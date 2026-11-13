import { useId, useMemo, useState, type FormEvent } from "react";
import { BULK_MAX_ITEMS, linkStudioApi, LinkStudioError, type BulkItemResult } from "../../lib/linkStudio/client";
import { bulkResultsCsv, parseBulkInput, type BulkOutcome } from "../../lib/linkStudio/bulk";
import { expiryProblem, localInputToIso } from "../../lib/linkStudio/format";
import { copyToClipboard } from "../../lib/clipboard";
import { downloadBlob } from "../../lib/downloadBlob";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { useToast } from "../ui/ToastProvider";

const inputClass = "focus-ring h-11 w-full rounded-[var(--radius-control)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900";

/**
 * Bulk shortener: up to BULK_MAX_ITEMS links sent as ONE request (the Worker creates them in a single batch),
 * never one request per URL. After a run the form is locked until "Start a new batch", so a double click or a
 * second press can't create the same links twice.
 */
export function BulkShortener({ onCreated }: { onCreated: () => void }) {
  const id = useId();
  const { showToast } = useToast();
  const [text, setText] = useState("");
  const [expiry, setExpiry] = useState("");
  const [oneTime, setOneTime] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outcomes, setOutcomes] = useState<BulkOutcome[] | null>(null);

  const parsed = useMemo(() => parseBulkInput(text), [text]);
  const valid = parsed.rows.filter((r) => !r.problem);
  const invalid = parsed.rows.length - valid.length;
  const expiryError = expiryProblem(expiry);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || outcomes || parsed.tooMany || valid.length === 0 || expiryError) return;
    setBusy(true);
    setError(null);
    try {
      const res = await linkStudioApi.createBulk({
        items: valid.map((r) => ({ url: r.url, ...(r.alias ? { alias: r.alias } : {}) })),
        ...(expiry ? { expiresAt: localInputToIso(expiry) } : {}),
        ...(oneTime ? { oneTime: true } : {}),
      });
      const byValidIndex = new Map<number, BulkItemResult>(res.results.map((r) => [r.index, r]));
      let v = 0;
      setOutcomes(parsed.rows.map((row) => (row.problem ? { row } : { row, result: byValidIndex.get(v++) })));
      if (res.created > 0) onCreated();
    } catch (err) {
      setError(
        err instanceof LinkStudioError
          ? err.status === 429
            ? "Too many link-creation requests in the last minute — wait a moment and try again."
            : err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setOutcomes(null);
    setText("");
    setError(null);
  };

  const created = outcomes?.filter((o) => o.result?.ok) ?? [];
  const copyAll = async () => {
    const ok = await copyToClipboard(created.map((o) => (o.result?.ok ? o.result.link.shortUrl : "")).join("\n"));
    showToast(ok ? `${created.length} short links copied` : "Couldn't copy", ok ? "success" : "error");
  };

  if (outcomes) {
    return (
      <section aria-labelledby={`${id}-results`} className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id={`${id}-results`} className="text-base font-semibold text-neutral-900">
            {created.length} created · {outcomes.length - created.length} failed
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => downloadBlob(new Blob([bulkResultsCsv(outcomes)], { type: "text/csv;charset=utf-8" }), "short-links.csv")}>
              Download CSV
            </Button>
            <Button variant="secondary" onClick={copyAll} disabled={created.length === 0}>
              Copy all short links
            </Button>
            <Button variant="tertiary" onClick={reset}>
              Start a new batch
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-neutral-200 bg-white">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <caption className="sr-only">Bulk shortening results</caption>
            <thead className="bg-neutral-100 text-neutral-900">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">Line</th>
                <th scope="col" className="px-3 py-2 font-semibold">Destination</th>
                <th scope="col" className="px-3 py-2 font-semibold">Result</th>
                <th scope="col" className="px-3 py-2 font-semibold"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {outcomes.map(({ row, result }) => {
                const link = result?.ok ? result.link : null;
                const message = row.problem ?? (result && !result.ok ? result.error.message : "Not processed");
                return (
                  <tr key={row.line} className="border-t border-neutral-200 align-top">
                    <td className="px-3 py-2 text-neutral-600 tabular-nums">{row.line}</td>
                    <td className="max-w-[320px] px-3 py-2 break-all text-neutral-900">{row.url}</td>
                    <td className="px-3 py-2">
                      {link ? (
                        <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="font-mono font-semibold break-all text-brand-700 hover:underline">
                          {link.shortUrl}
                        </a>
                      ) : (
                        <span className="text-error-600">{message}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {link && (
                        <Button
                          variant="tertiary"
                          onClick={async () => {
                            const ok = await copyToClipboard(link.shortUrl);
                            showToast(ok ? "Short link copied" : "Couldn't copy", ok ? "success" : "error");
                          }}
                        >
                          Copy<span className="sr-only"> {link.shortUrl}</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-neutral-200 bg-white p-4 sm:p-6">
      <div>
        <label htmlFor={`${id}-list`} className="mb-1.5 block text-sm font-semibold text-neutral-900">
          URLs to shorten
        </label>
        <textarea
          id={`${id}-list`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder={"https://www.example.com/spring-sale\nhttps://www.example.com/menu  menu-2026"}
          aria-describedby={`${id}-help`}
          className="focus-ring w-full rounded-[var(--radius-control)] border border-neutral-200 bg-white p-3 font-mono text-sm text-neutral-900"
        />
        <p id={`${id}-help`} className="mt-1 text-xs text-neutral-600">
          One URL per line, up to {BULK_MAX_ITEMS}. To choose a custom alias, add it after the URL, separated by a space. All links are created in a single
          request.
        </p>
      </div>

      {parsed.rows.length > 0 && (
        <p className="text-sm text-neutral-700" aria-live="polite">
          {valid.length} ready{invalid > 0 ? ` · ${invalid} with problems (they won't be sent)` : ""}
          {parsed.tooMany && <span className="text-error-600"> · Too many lines: the limit is {BULK_MAX_ITEMS} per batch.</span>}
        </p>
      )}
      {invalid > 0 && (
        <ul className="ml-5 list-disc text-xs text-error-600">
          {parsed.rows
            .filter((r) => r.problem)
            .slice(0, 8)
            .map((r) => (
              <li key={r.line}>
                Line {r.line}: {r.problem}
              </li>
            ))}
        </ul>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-exp`} className="mb-1.5 block text-sm font-semibold text-neutral-900">
            Expires <span className="font-normal text-neutral-600">(optional, applies to every link)</span>
          </label>
          <input id={`${id}-exp`} type="datetime-local" value={expiry} onChange={(e) => setExpiry(e.target.value)} aria-invalid={Boolean(expiryError)} className={inputClass} />
          {expiryError && <p className="mt-1 text-xs text-error-600">{expiryError}</p>}
        </div>
        <label className="flex items-center gap-2 self-end pb-3 text-sm text-neutral-900">
          <input type="checkbox" checked={oneTime} onChange={(e) => setOneTime(e.target.checked)} className="h-4 w-4" />
          Make every link one-time
        </label>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div>
        <Button type="submit" disabled={busy || valid.length === 0 || parsed.tooMany || Boolean(expiryError)}>
          {busy ? "Creating…" : `Create ${valid.length || ""} short link${valid.length === 1 ? "" : "s"}`.replace("  ", " ")}
        </Button>
      </div>
    </form>
  );
}
