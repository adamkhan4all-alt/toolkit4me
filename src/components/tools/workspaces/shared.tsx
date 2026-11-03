import type { ReactNode } from "react";
import { Button } from "../../ui/Button";
import { useToast } from "../../ui/ToastProvider";
import { copyToClipboard } from "../../../lib/clipboard";
import { downloadBlob } from "../../../lib/downloadBlob";

/** Building blocks shared by the text/settings-based tool workspaces, matching the existing upload workspaces' look. */

export const panelClass = "flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 sm:p-6";
export const labelClass = "mb-1.5 block text-sm font-semibold text-neutral-900";
export const textareaClass =
  "focus-ring w-full rounded-[var(--radius-control)] border border-neutral-200 bg-white p-3 font-mono text-sm leading-6 text-neutral-900";
export const inputClass =
  "focus-ring h-11 w-full rounded-[var(--radius-control)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900";

export function CopyButton({ text, label = "Copy", disabled }: { text: string; label?: string; disabled?: boolean }) {
  const { showToast } = useToast();
  return (
    <Button
      variant="secondary"
      disabled={disabled || !text}
      onClick={async () => {
        const ok = await copyToClipboard(text);
        showToast(ok ? "Copied to clipboard" : "Couldn't copy — select the text and copy it manually", ok ? "success" : "error");
      }}
    >
      {label}
    </Button>
  );
}

export function DownloadTextButton({
  text,
  fileName,
  mime = "text/plain;charset=utf-8",
  label = "Download",
}: {
  text: string;
  fileName: string;
  mime?: string;
  label?: string;
}) {
  return (
    <Button variant="secondary" disabled={!text} onClick={() => downloadBlob(new Blob([text], { type: mime }), fileName)}>
      {label}
    </Button>
  );
}

/** Small live character counter shown under a field. */
export function CharCount({ value, limit }: { value: string; limit?: number }) {
  const over = limit !== undefined && value.length > limit;
  return (
    <p className={`mt-1 text-xs ${over ? "text-error-600" : "text-neutral-600"}`}>
      {value.length.toLocaleString()}
      {limit !== undefined ? ` / ${limit.toLocaleString()}` : ""} characters
    </p>
  );
}

export function PrivacyLine({ children = "Runs entirely in your browser — nothing you enter is sent to a server." }: { children?: ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-neutral-600">
      <span aria-hidden="true">🔒</span>
      {children}
    </p>
  );
}
