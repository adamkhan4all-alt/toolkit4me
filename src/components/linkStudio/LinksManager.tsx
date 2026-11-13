import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { linkStudioApi, LinkStudioError, type ListParams, type Pagination, type RedirectType, type ShortLink } from "../../lib/linkStudio/client";
import { destinationProblem, expiryProblem, formatDateTime, isoToLocalInput, localInputToIso, REDIRECT_LABELS } from "../../lib/linkStudio/format";
import { copyToClipboard } from "../../lib/clipboard";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { LoadingState } from "../ui/LoadingState";
import { useToast } from "../ui/ToastProvider";
import { QrDownload } from "./QrDownload";

const PAGE_SIZE = 20;
const inputClass = "focus-ring h-10 w-full rounded-[var(--radius-control)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900";

const STATUS_BADGE: Record<ShortLink["status"], string> = {
  active: "bg-success-50 text-success-600",
  inactive: "bg-neutral-100 text-neutral-700",
  expired: "bg-warning-50 text-warning-600",
  used: "bg-neutral-100 text-neutral-700",
};
const STATUS_LABEL: Record<ShortLink["status"], string> = { active: "Active", inactive: "Disabled", expired: "Expired", used: "Used (one-time)" };

type Query = Required<Pick<ListParams, "page" | "status" | "sort" | "order">> & { search: string; source: "" | "admin" | "public" };

export function LinksManager({ refreshKey, onShowAnalytics }: { refreshKey: number; onShowAnalytics: (code: string) => void }) {
  const id = useId();
  const { showToast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState<Query>({ page: 1, search: "", status: "all", source: "", sort: "created_at", order: "desc" });
  const [data, setData] = useState<{ items: ShortLink[]; pagination: Pagination } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [editing, setEditing] = useState<ShortLink | null>(null);
  const [deleting, setDeleting] = useState<ShortLink | null>(null);
  const [qrFor, setQrFor] = useState<string | null>(null);

  // Debounced search: one request after typing pauses, not one per keystroke.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setQuery((q) => (q.search === searchInput.trim() ? q : { ...q, search: searchInput.trim(), page: 1 }));
    }, 350);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    linkStudioApi
      .list({ ...query, source: query.source || undefined, limit: PAGE_SIZE })
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setError(null);
      })
      .catch((err) => !cancelled && setError(err instanceof LinkStudioError ? err.message : "Links couldn't be loaded."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [query, reload, refreshKey]);

  const update = (patch: Partial<Query>) => {
    setLoading(true);
    setQuery((q) => ({ ...q, ...patch }));
  };
  const refresh = () => {
    setLoading(true);
    setReload((n) => n + 1);
  };

  const toggleActive = async (link: ShortLink) => {
    try {
      await linkStudioApi.update(link.code, { isActive: !link.isActive });
      showToast(link.isActive ? `/${link.code} disabled` : `/${link.code} re-activated`, "success");
      refresh();
    } catch (err) {
      showToast(err instanceof LinkStudioError ? err.message : "The link couldn't be updated.", "error");
    }
  };

  const copy = async (link: ShortLink) => {
    const ok = await copyToClipboard(link.shortUrl);
    showToast(ok ? "Short link copied" : "Couldn't copy the link", ok ? "success" : "error");
  };

  const p = data?.pagination;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <div>
          <label htmlFor={`${id}-search`} className="sr-only">
            Search links
          </label>
          <input id={`${id}-search`} type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by code or destination…" maxLength={100} className={inputClass} />
        </div>
        <div>
          <label htmlFor={`${id}-status`} className="sr-only">
            Status
          </label>
          <select id={`${id}-status`} value={query.status} onChange={(e) => update({ status: e.target.value as Query["status"], page: 1 })} className={inputClass}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Disabled</option>
            <option value="expired">Expired</option>
            <option value="used">Used one-time links</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-source`} className="sr-only">
            Created by
          </label>
          <select id={`${id}-source`} value={query.source} onChange={(e) => update({ source: e.target.value as Query["source"], page: 1 })} className={inputClass}>
            <option value="">Team and public</option>
            <option value="admin">Team links</option>
            <option value="public">Public shortener links</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-sort`} className="sr-only">
            Sort
          </label>
          <select
            id={`${id}-sort`}
            value={`${query.sort}:${query.order}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split(":") as [Query["sort"], Query["order"]];
              update({ sort, order, page: 1 });
            }}
            className={inputClass}
          >
            <option value="created_at:desc">Newest first</option>
            <option value="created_at:asc">Oldest first</option>
            <option value="clicks:desc">Most clicks</option>
            <option value="last_clicked_at:desc">Recently clicked</option>
            <option value="expires_at:asc">Expiring soonest</option>
          </select>
        </div>
      </div>

      {error && (
        <Alert variant="error" title="Couldn't load links">
          <p className="mb-2">{error}</p>
          <Button variant="secondary" onClick={refresh}>
            Try again
          </Button>
        </Alert>
      )}
      {loading && !data && <LoadingState label="Loading links…" />}

      {data && data.items.length === 0 && !error && (
        <p className="rounded-[var(--radius-card)] border border-dashed border-neutral-200 bg-white p-6 text-center text-sm text-neutral-600">
          {query.search || query.status !== "all" ? "No links match these filters." : "No short links yet — create one in the Create tab."}
        </p>
      )}

      {data && data.items.length > 0 && (
        <ul className={`flex flex-col gap-3 ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
          {data.items.map((link) => (
            <li key={link.code} className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-neutral-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-sm font-semibold break-all text-brand-700 hover:underline">
                    {link.shortUrl}
                  </a>
                  <span className="text-sm break-all text-neutral-600" title={link.url}>
                    → {link.url.length > 120 ? `${link.url.slice(0, 120)}…` : link.url}
                  </span>
                </div>
                <span className="flex shrink-0 gap-1.5">
                  {link.source === "public" && <span className="rounded bg-warning-50 px-2 py-0.5 text-xs font-semibold text-warning-600">Public</span>}
                  {link.oneTime && link.status !== "used" && <span className="rounded bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">One-time</span>}
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[link.status]}`}>{STATUS_LABEL[link.status]}</span>
                </span>
              </div>
              {link.redeemedAt && <p className="text-xs text-neutral-600">Opened once on {formatDateTime(link.redeemedAt)} — it no longer redirects.</p>}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-5">
                <div>
                  <dt className="text-neutral-600">Code</dt>
                  <dd className="font-mono text-neutral-900">{link.code}</dd>
                </div>
                <div>
                  <dt className="text-neutral-600">Clicks</dt>
                  <dd className="font-semibold text-neutral-900 tabular-nums">{link.clicks.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-neutral-600">Created</dt>
                  <dd className="text-neutral-900">{formatDateTime(link.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-neutral-600">Last clicked</dt>
                  <dd className="text-neutral-900">{formatDateTime(link.lastClickedAt, "Never")}</dd>
                </div>
                <div>
                  <dt className="text-neutral-600">Expires</dt>
                  <dd className="text-neutral-900">{formatDateTime(link.expiresAt, "Never")}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-1.5">
                <SmallButton onClick={() => copy(link)}>Copy</SmallButton>
                <SmallButton onClick={() => setQrFor(qrFor === link.code ? null : link.code)}>{qrFor === link.code ? "Hide QR" : "QR code"}</SmallButton>
                <SmallButton onClick={() => onShowAnalytics(link.code)}>Analytics</SmallButton>
                <SmallButton onClick={() => setEditing(link)}>Edit</SmallButton>
                <SmallButton onClick={() => toggleActive(link)}>{link.isActive ? "Disable" : "Re-activate"}</SmallButton>
                <SmallButton danger onClick={() => setDeleting(link)}>
                  Delete
                </SmallButton>
              </div>
              {qrFor === link.code && (
                <div className="rounded-[var(--radius-control)] border border-neutral-200 bg-neutral-50 p-3">
                  <QrDownload value={link.shortUrl} fileBase={`qr-${link.code}`} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {p && p.totalPages > 1 && (
        <nav aria-label="Pages" className="flex items-center justify-between gap-2 text-sm">
          <Button variant="secondary" disabled={p.page <= 1 || loading} onClick={() => update({ page: p.page - 1 })}>
            ← Previous
          </Button>
          <span className="text-neutral-600">
            Page {p.page} of {p.totalPages} · {p.total.toLocaleString()} links
          </span>
          <Button variant="secondary" disabled={!p.hasMore || loading} onClick={() => update({ page: p.page + 1 })}>
            Next →
          </Button>
        </nav>
      )}
      {p && p.totalPages <= 1 && data && data.items.length > 0 && <p className="text-xs text-neutral-600">{p.total.toLocaleString()} links</p>}

      {editing && (
        <EditLinkDialog
          link={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            showToast("Link updated", "success");
            refresh();
          }}
        />
      )}
      {deleting && (
        <DeleteDialog
          link={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null);
            showToast(`/${deleting.code} deleted`, "success");
            refresh();
          }}
        />
      )}
    </div>
  );
}

function SmallButton({ children, onClick, danger }: { children: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring min-h-9 rounded-[var(--radius-control)] border px-3 text-sm font-medium ${danger ? "border-transparent text-error-600 hover:bg-error-50" : "border-neutral-200 bg-white text-neutral-900 hover:border-brand-600"}`}
    >
      {children}
    </button>
  );
}

/** Native <dialog>: focus trapping, Escape to close and the backdrop come from the browser. */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal?.();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto w-[min(560px,calc(100vw-32px))] rounded-[var(--radius-card)] border border-neutral-200 bg-white p-0 shadow-xl backdrop:bg-neutral-900/40"
    >
      <div className="flex flex-col gap-4 p-5">
        <h2 id={titleId} className="text-lg font-bold text-neutral-900">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}

function EditLinkDialog({ link, onClose, onSaved }: { link: ShortLink; onClose: () => void; onSaved: () => void }) {
  const id = useId();
  const [url, setUrl] = useState(link.url);
  const [redirectType, setRedirectType] = useState<RedirectType>(link.redirectType);
  const [expiry, setExpiry] = useState(isoToLocalInput(link.expiresAt));
  const [isActive, setIsActive] = useState(link.isActive);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = destinationProblem(url) ?? (expiry && expiry !== isoToLocalInput(link.expiresAt) ? expiryProblem(expiry) : null);
    if (problem) return setError(problem);
    const changes: Parameters<typeof linkStudioApi.update>[1] = {};
    if (url.trim() !== link.url) changes.url = url.trim();
    if (redirectType !== link.redirectType) changes.redirectType = redirectType;
    if (isActive !== link.isActive) changes.isActive = isActive;
    if (expiry !== isoToLocalInput(link.expiresAt)) changes.expiresAt = expiry ? localInputToIso(expiry) : null;
    if (Object.keys(changes).length === 0) return onClose();
    setBusy(true);
    setError(null);
    try {
      await linkStudioApi.update(link.code, changes);
      onSaved();
    } catch (err) {
      setError(err instanceof LinkStudioError ? (err.details[0]?.message ?? err.message) : "The link couldn't be saved.");
      setBusy(false);
    }
  };

  return (
    <Modal title={`Edit /${link.code}`} onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <p className="text-xs text-neutral-600">The short code can't be changed. Changes apply to the next click.</p>
        <div>
          <label htmlFor={`${id}-url`} className="mb-1.5 block text-sm font-semibold text-neutral-900">
            Destination URL
          </label>
          <input id={`${id}-url`} type="url" value={url} onChange={(e) => setUrl(e.target.value)} maxLength={2048} spellCheck={false} className={inputClass} />
        </div>
        <div>
          <label htmlFor={`${id}-rt`} className="mb-1.5 block text-sm font-semibold text-neutral-900">
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
          <label htmlFor={`${id}-exp`} className="mb-1.5 block text-sm font-semibold text-neutral-900">
            Expires <span className="font-normal text-neutral-600">(empty = never)</span>
          </label>
          <div className="flex gap-2">
            <input id={`${id}-exp`} type="datetime-local" value={expiry} onChange={(e) => setExpiry(e.target.value)} className={inputClass} />
            {expiry && (
              <Button type="button" variant="tertiary" onClick={() => setExpiry("")}>
                Clear
              </Button>
            )}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-900">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4" />
          Active
        </label>
        {error && <Alert variant="error">{error}</Alert>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteDialog({ link, onClose, onDeleted }: { link: ShortLink; onClose: () => void; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      await linkStudioApi.remove(link.code);
      onDeleted();
    } catch (err) {
      setError(err instanceof LinkStudioError ? err.message : "The link couldn't be deleted.");
      setBusy(false);
    }
  };
  return (
    <Modal title={`Delete /${link.code}?`} onClose={onClose}>
      <p className="text-sm text-neutral-700">
        <span className="font-mono break-all">{link.shortUrl}</span> will stop working immediately and its click history ({link.clicks.toLocaleString()} clicks) will be deleted. This can't be undone. To stop
        it temporarily instead, use Disable.
      </p>
      {error && <Alert variant="error">{error}</Alert>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <button type="button" onClick={remove} disabled={busy} className="focus-ring min-h-11 rounded-[var(--radius-control)] bg-error-600 px-4 text-[15px] font-medium text-white hover:opacity-90 disabled:opacity-60">
          {busy ? "Deleting…" : "Delete permanently"}
        </button>
      </div>
    </Modal>
  );
}
