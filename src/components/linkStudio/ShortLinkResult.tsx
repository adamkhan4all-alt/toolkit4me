import { useEffect, useState } from "react";
import type { ShortLink } from "../../lib/linkStudio/client";
import { formatDateTime } from "../../lib/linkStudio/format";
import { copyToClipboard } from "../../lib/clipboard";
import { downloadBlob } from "../../lib/downloadBlob";
import { Button } from "../ui/Button";
import { useToast } from "../ui/ToastProvider";

/** The created short link: copy, share, QR code. */
export function ShortLinkResult({ link, onCreateAnother }: { link: ShortLink; onCreateAnother: () => void }) {
  const { showToast } = useToast();
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("qrcode")
      .then((m) => m.default.toDataURL(link.shortUrl, { errorCorrectionLevel: "M", margin: 4, width: 512 }))
      .then((url) => !cancelled && setQr(url))
      .catch(() => !cancelled && setQr(null));
    return () => {
      cancelled = true;
    };
  }, [link.shortUrl]);

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

  const downloadQr = async () => {
    if (!qr) return;
    const blob = await (await fetch(qr)).blob();
    downloadBlob(blob, `qr-${link.code}.png`);
  };

  return (
    <section aria-labelledby="result-heading" className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-success-600 bg-success-50 p-4 sm:p-6">
      <h3 id="result-heading" className="text-base font-semibold text-neutral-900">
        Short link created
      </h3>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
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
            {link.redirectType} redirect · {link.isActive ? "Active" : "Disabled"} · {link.expiresAt ? `Expires ${formatDateTime(link.expiresAt)}` : "Never expires"}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={copy}>Copy link</Button>
            <Button variant="secondary" onClick={share}>
              Share
            </Button>
            <Button variant="secondary" onClick={downloadQr} disabled={!qr}>
              Download QR
            </Button>
            <Button variant="tertiary" onClick={onCreateAnother}>
              Create another
            </Button>
          </div>
        </div>
        {qr && <img src={qr} alt={`QR code for ${link.shortUrl}`} width={144} height={144} className="h-36 w-36 shrink-0 rounded-lg border border-neutral-200 bg-white" />}
      </div>
    </section>
  );
}
