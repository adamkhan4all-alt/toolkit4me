import type { ProcessingMode } from "../../types/tool";

/**
 * Short trust/privacy line shown near the upload area. Copy adapts to the
 * tool's processing mode: CLIENT-mode tools can truthfully say the file
 * never leaves the device; SERVER-mode tools state the retention window.
 */
export function PrivacyNotice({ processingMode }: { processingMode: ProcessingMode }) {
  const message =
    processingMode === "CLIENT"
      ? "This tool runs entirely in your browser — your file is never uploaded to a server."
      : "Your file is transferred securely and automatically deleted from our servers after 1 hour.";

  return (
    <p className="flex items-center gap-1.5 text-xs text-neutral-400">
      <span aria-hidden="true">🔒</span>
      {message}
    </p>
  );
}
