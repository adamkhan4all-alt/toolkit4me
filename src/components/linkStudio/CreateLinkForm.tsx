import { useId, useState, type FormEvent } from "react";
import { linkStudioApi, LinkStudioError, type RedirectType, type ShortLink } from "../../lib/linkStudio/client";
import { aliasProblem, destinationProblem, expiryProblem, localInputToIso, REDIRECT_LABELS } from "../../lib/linkStudio/format";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { ShortLinkResult } from "./ShortLinkResult";

export const SHORT_DOMAIN = "go.toolkit4me.com";

const inputClass = "focus-ring h-11 w-full rounded-[var(--radius-control)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900 aria-[invalid=true]:border-error-600";
const labelClass = "mb-1.5 block text-sm font-semibold text-neutral-900";

type FieldErrors = Partial<Record<"url" | "alias" | "expiresAt" | "redirectType", string>>;

export function CreateLinkForm({ onCreated }: { onCreated: (link: ShortLink) => void }) {
  const id = useId();
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [redirectType, setRedirectType] = useState<RedirectType>(302);
  const [expiry, setExpiry] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<ShortLink | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = {};
    const u = destinationProblem(url);
    if (u) next.url = u;
    const a = aliasProblem(alias);
    if (a) next.alias = a;
    const x = expiryProblem(expiry);
    if (x) next.expiresAt = x;
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      const link = await linkStudioApi.create({
        url: url.trim(),
        ...(alias.trim() ? { alias: alias.trim() } : {}),
        ...(expiry ? { expiresAt: localInputToIso(expiry) } : {}),
        redirectType,
        isActive,
      });
      setCreated(link);
      onCreated(link);
    } catch (err) {
      if (err instanceof LinkStudioError) {
        if (err.code === "alias_taken") setErrors({ alias: "That alias is already in use — choose another." });
        else if (err.details.length > 0) {
          const fieldErrors: FieldErrors = {};
          for (const d of err.details) if (d.path === "url" || d.path === "alias" || d.path === "expiresAt" || d.path === "redirectType") fieldErrors[d.path] ??= d.message;
          setErrors(fieldErrors);
          if (Object.keys(fieldErrors).length === 0) setFormError(err.message);
        } else setFormError(err.status === 429 ? "Too many links created in the last minute — wait a moment and try again." : err.message);
      } else setFormError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setCreated(null);
    setUrl("");
    setAlias("");
    setExpiry("");
    setRedirectType(302);
    setIsActive(true);
    setErrors({});
  };

  if (created) return <ShortLinkResult link={created} onCreateAnother={reset} />;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-neutral-200 bg-white p-4 sm:p-6">
      <div>
        <label htmlFor={`${id}-url`} className={labelClass}>
          Destination URL
        </label>
        <input
          id={`${id}-url`}
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.example.com/a-very-long-page-address"
          autoComplete="off"
          spellCheck={false}
          maxLength={2048}
          aria-invalid={Boolean(errors.url)}
          aria-describedby={errors.url ? `${id}-url-err` : undefined}
          className={inputClass}
        />
        {errors.url && (
          <p id={`${id}-url-err`} className="mt-1 text-xs text-error-600">
            {errors.url}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${id}-alias`} className={labelClass}>
          Custom alias <span className="font-normal text-neutral-600">(optional)</span>
        </label>
        <div className="flex items-stretch">
          <span className="inline-flex items-center rounded-l-[var(--radius-control)] border border-r-0 border-neutral-200 bg-neutral-50 px-3 font-mono text-xs text-neutral-600">{SHORT_DOMAIN}/</span>
          <input
            id={`${id}-alias`}
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="summer26"
            autoComplete="off"
            spellCheck={false}
            maxLength={64}
            aria-invalid={Boolean(errors.alias)}
            aria-describedby={`${id}-alias-help`}
            className={`${inputClass} rounded-l-none font-mono`}
          />
        </div>
        <p id={`${id}-alias-help`} className={`mt-1 text-xs ${errors.alias ? "text-error-600" : "text-neutral-600"}`}>
          {errors.alias ?? "3–64 letters, numbers, - or _. Case-sensitive. Leave empty for a random 7-character code."}
        </p>
      </div>

      <button type="button" onClick={() => setShowOptions((v) => !v)} aria-expanded={showOptions} className="focus-ring w-fit rounded text-sm font-semibold text-brand-700 hover:underline">
        {showOptions ? "Hide options" : "More options: redirect type, expiry, status"}
      </button>

      {showOptions && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor={`${id}-rt`} className={labelClass}>
              Redirect type
            </label>
            <select id={`${id}-rt`} value={redirectType} onChange={(e) => setRedirectType(Number(e.target.value) as RedirectType)} className={inputClass}>
              {[302, 307, 301, 308].map((t) => (
                <option key={t} value={t}>
                  {REDIRECT_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-exp`} className={labelClass}>
              Expires <span className="font-normal text-neutral-600">(optional, your local time)</span>
            </label>
            <input
              id={`${id}-exp`}
              type="datetime-local"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              aria-invalid={Boolean(errors.expiresAt)}
              className={inputClass}
            />
            {errors.expiresAt && <p className="mt-1 text-xs text-error-600">{errors.expiresAt}</p>}
          </div>
          <label className="flex items-center gap-2 self-end pb-3 text-sm text-neutral-900">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4" />
            Active as soon as it's created
          </label>
        </div>
      )}

      {formError && <Alert variant="error">{formError}</Alert>}

      <div>
        <Button type="submit" disabled={busy}>
          {busy ? "Creating…" : "Create Short Link"}
        </Button>
      </div>
    </form>
  );
}
