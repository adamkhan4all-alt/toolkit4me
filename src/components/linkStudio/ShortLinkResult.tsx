import type { ShortLink } from "../../lib/linkStudio/client";
import { formatDateTime } from "../../lib/linkStudio/format";
import { copyToClipboard } from "../../lib/clipboard";
import { Button } from "../ui/Button";
import { useToast } from "../ui/ToastProvider";
import { QrDownload } from "./QrDownload";

/** The created short link: copy, open, share, and a QR code (PNG/SVG). */
export function ShortLinkResult({ link, onCreateAnother }: { link: ShortLink; onCreateAnother: () => void }) {
  const { showToast } = useToast();

  const copy = async () => {
    const ok = await copyToClipboard(link.shortUrl);
    showToast(ok ? "Short link copied" : "Couldn't copy — select the link and copy it manually", ok ? "success" : "error");
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url: link.shortUrl });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    await copy();
  };

  return (
    <section aria-labelledby="result-heading" className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-success-600 bg-success-50 p-4 sm:p-6">
      <h3 id="result-heading" className="text-base font-semibold text-neutral-900">
        Short link created
      </h3>
      <div className="flex min-w-0 flex-col gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-neutral-600 uppercase">Short link</p>
          <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-lg font-bold break-all text-brand-700 hover:underline">
            {link.shortUrl}
          </a>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wide text-neutral-600 uppercase">Redirects to</p>
          <p className="text-sm break-all text-neutral-900">{link.url}</p>
        </div>
        <p className="text-xs text-neutral-600">
          {link.oneTime ? "One-time link (works once, after a confirmation page)" : `${link.redirectType} redirect`} · {link.isActive ? "Active" : "Disabled"} ·{" "}
          {link.expiresAt ? `Expires ${formatDateTime(link.expiresAt)}` : "Never expires"} · Created {formatDateTime(link.createdAt)}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={copy}>Copy link</Button>
          <a
            href={link.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-neutral-300 bg-white px-4 text-[15px] font-medium text-neutral-900 hover:border-brand-600"
          >
            Open link<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <Button variant="secondary" onClick={share}>
            Share
          </Button>
          <Button variant="tertiary" onClick={onCreateAnother}>
            Create another
          </Button>
        </div>
        {link.oneTime && <p className="text-xs text-neutral-600">Opening it yourself and pressing Continue will use it up. Share it only with the person who should open it.</p>}
      </div>
      <div className="rounded-[var(--radius-control)] border border-neutral-200 bg-white p-3">
        <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-600 uppercase">QR code</p>
        <QrDownload value={link.shortUrl} fileBase={`qr-${link.code}`} />
      </div>
    </section>
  );
}
