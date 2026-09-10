/** Triggers a real browser download of an in-memory Blob — no server round-trip. */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Give the browser a moment to pick up the download before revoking.
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
