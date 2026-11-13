import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { ToolDefinition } from "../../../types/tool";
import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { QrDownload } from "../../linkStudio/QrDownload";
import { publicShortener, PublicShortenerError, solveInWorker, timeUntil, type PublicLink, type PublicQuota } from "../../../lib/linkStudio/publicClient";
import type { PowChallenge } from "../../../lib/linkStudio/pow";
import { CopyButton, inputClass, labelClass, panelClass } from "./shared";

type Phase = "idle" | "checking" | "creating";

/** Quick client-side check so obvious mistakes don't cost a request; the Worker re-validates everything. */
function urlProblem(raw: string): string | null {
  const v = raw.trim();
  if (!v) return "Paste the address you want to shorten.";
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    return "Enter a full address starting with https://";
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return "Only http:// and https:// addresses can be shortened.";
  return null;
}

const formatReset = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} your time (00:00 UTC)`;
};

/**
 * Public, anonymous URL shortener. All limits are enforced by the go.toolkit4me.com Worker; this page only shows
 * them. A first-time visitor's browser solves a small proof-of-work check before the first link.
 */
export default function UrlShortenerWorkspace({ tool }: { tool: ToolDefinition }) {
  const id = useId();
  const [url, setUrl] = useState("");
  const [quota, setQuota] = useState<PublicQuota | null>(null);
  const [challenge, setChallenge] = useState<PowChallenge | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [created, setCreated] = useState<PublicLink[]>([]);
  const [unavailable, setUnavailable] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const s = await publicShortener.status();
      setQuota(s.quota);
      setChallenge(s.challenge);
      setUnavailable(false);
    } catch {
      setUnavailable(true);
    }
  }, []);

  // Initial load: the allowance and (for a new visitor) a challenge to pre-solve. State updates happen in callbacks.
  useEffect(() => {
    let cancelled = false;
    publicShortener
      .status()
      .then((s) => {
        if (cancelled) return;
        setQuota(s.quota);
        setChallenge(s.challenge);
      })
      .catch(() => !cancelled && setUnavailable(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (phase !== "idle") return;
    const problem = urlProblem(url);
    setFieldError(problem);
    setError(null);
    if (problem) return;

    const attempt = async (ch: PowChallenge | null, retried: boolean): Promise<void> => {
      let solution: { challenge: PowChallenge; nonce: string } | undefined;
      if (ch) {
        setPhase("checking");
        solution = { challenge: ch, nonce: await solveInWorker(ch) };
      }
      setPhase("creating");
      try {
        const res = await publicShortener.create({ url: url.trim(), ...(solution ?? {}) });
        setCreated((list) => [res.link, ...list]);
        setQuota(res.quota);
        setChallenge(null);
        setUrl("");
      } catch (err) {
        if (err instanceof PublicShortenerError && err.code === "challenge_required" && !retried && err.details.challenge) {
          return attempt(err.details.challenge as PowChallenge, true);
        }
        throw err;
      }
    };

    try {
      await attempt(challenge, false);
    } catch (err) {
      if (err instanceof PublicShortenerError) {
        if (err.code === "daily_limit_reached") {
          setError(null);
          await refresh();
        } else if (err.code === "validation_error") setFieldError(err.message);
        else if (err.status === 429) setError("You're creating links very quickly. Please wait a minute and try again.");
        else setError(err.message);
        if (err.code === "challenge_required") await refresh();
      } else setError("Something went wrong. Please try again.");
    } finally {
      setPhase("idle");
    }
  };

  const outOfLinks = quota !== null && quota.remaining === 0;

  return (
    <div className={panelClass}>
      {unavailable && (
        <Alert variant="error" title="The shortener can't be reached right now">
          Please try again in a moment. The other URL tools on this page still work.
        </Alert>
      )}

      {quota && (
        <div aria-live="polite" className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-brand-50 px-4 py-3 text-sm text-neutral-800">
          <span>
            <strong className="text-neutral-900">{quota.remaining}</strong> of {quota.limit} free short links left today
          </span>
          <span className="text-xs text-neutral-600">Resets at {formatReset(quota.resetsAt)}</span>
        </div>
      )}

      {outOfLinks ? (
        <Alert variant="info" title="You've used today's free short links">
          You can create {quota.limit} more {timeUntil(quota.resetsAt)}, at {formatReset(quota.resetsAt)}. Your links below keep working.
        </Alert>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-3">
          <label htmlFor={`${id}-url`} className={labelClass}>
            Long URL
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
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
              aria-invalid={Boolean(fieldError)}
              aria-describedby={`${id}-help`}
              className={inputClass}
            />
            <Button type="submit" disabled={phase !== "idle" || unavailable || quota === null}>
              {phase === "checking" ? "Checking…" : phase === "creating" ? "Shortening…" : tool.actionLabel}
            </Button>
          </div>
          <p id={`${id}-help`} className={`text-xs ${fieldError ? "text-error-600" : "text-neutral-600"}`}>
            {fieldError ??
              (phase === "checking"
                ? "Your browser is completing a quick automatic check against bots…"
                : "Links are created on go.toolkit4me.com with a random code. Anyone with the link can open it.")}
          </p>
        </form>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      {created.map((link, i) => (
        <section key={link.code} aria-label={`Short link ${link.shortUrl}`} className={`flex flex-col gap-3 rounded-lg border p-4 ${i === 0 ? "border-success-600 bg-success-50" : "border-neutral-200 bg-white"}`}>
          <div className="flex min-w-0 flex-col gap-1">
            <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-lg font-bold break-all text-brand-700 hover:underline">
              {link.shortUrl}
            </a>
            <p className="text-sm break-all text-neutral-700">→ {link.url}</p>
            <p className="text-xs text-neutral-600">Created {new Date(link.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={link.shortUrl} label="Copy link" />
            <a
              href={link.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-neutral-300 bg-white px-4 text-[15px] font-medium text-neutral-900 hover:border-brand-600"
            >
              Open link<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
          {i === 0 && <QrDownload value={link.shortUrl} fileBase={`qr-${link.code}`} />}
        </section>
      ))}

      <p className="text-xs leading-5 text-neutral-600">
        No account needed. A cookie on go.toolkit4me.com counts your daily links — see the{" "}
        <Link to="/privacy" className="text-brand-700 underline">
          Privacy Policy
        </Link>
        . Custom aliases, editing and click analytics are available to the Toolkit4Me team in the{" "}
        <Link to="/link-studio/admin" rel="nofollow" className="text-brand-700 underline">
          team console
        </Link>
        . Links used for spam, phishing or malware are disabled.
      </p>
    </div>
  );
}
